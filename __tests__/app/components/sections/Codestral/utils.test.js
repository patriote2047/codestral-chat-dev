import { delay, calculateRetryDelay, withTimeout, handleHttpError, logError } from './utils';

import {
    TimeoutError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    ServerError,
    API_CONSTANTS,
} from './errors';

describe('Fonctions utilitaires', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('delay', () => {
        it('devrait attendre le temps spécifié', async () => {
            const promise = delay(1000);
            jest.advanceTimersByTime(1000);
            await promise;
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
        });
    });

    describe('calculateRetryDelay', () => {
        it('devrait calculer le délai avec backoff exponentiel', () => {
            // Premier essai : délai initial + jitter
            const attempt1 = calculateRetryDelay(1);
            expect(attempt1).toBeGreaterThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY);
            expect(attempt1).toBeLessThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY + 1000);

            // Deuxième essai : délai initial * 2 + jitter
            const attempt2 = calculateRetryDelay(2);
            expect(attempt2).toBeGreaterThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY * 2);
            expect(attempt2).toBeLessThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY * 2 + 1000);

            // Troisième essai : délai initial * 4 + jitter
            const attempt3 = calculateRetryDelay(3);
            expect(attempt3).toBeGreaterThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY * 4);
            expect(attempt3).toBeLessThanOrEqual(API_CONSTANTS.INITIAL_RETRY_DELAY * 4 + 1000);
        });

        it('devrait respecter le délai maximum', () => {
            // Test avec une tentative élevée qui dépasserait normalement le maximum
            const attempt10 = calculateRetryDelay(10);
            expect(attempt10).toBeLessThanOrEqual(API_CONSTANTS.MAX_RETRY_DELAY);
        });
    });

    describe('withTimeout', () => {
        it('devrait résoudre si la promesse se résout avant le timeout', async () => {
            const promise = Promise.resolve('success');
            const result = withTimeout(promise, 1000);
            jest.advanceTimersByTime(500);
            await expect(result).resolves.toBe('success');
        });

        it('devrait rejeter si le timeout est atteint', async () => {
            const slowPromise = new Promise((resolve) => setTimeout(resolve, 2000));
            const result = withTimeout(slowPromise, 1000);

            jest.advanceTimersByTime(1100);
            await expect(result).rejects.toThrow('Request timed out');
        });

        it('devrait utiliser le timeout par défaut si non spécifié', async () => {
            const slowPromise = new Promise((resolve) => setTimeout(resolve, 31000));
            const result = withTimeout(slowPromise);

            jest.advanceTimersByTime(30100);
            await expect(result).rejects.toThrow('Request timed out');
        });
    });

    describe('handleHttpError', () => {
        it('devrait gérer les erreurs 400', async () => {
            const response = {
                status: 400,
                json: () => Promise.resolve({ error: 'Bad request' }),
                headers: new Map(),
            };
            await expect(handleHttpError(response)).rejects.toThrow(ValidationError);
        });

        it('devrait gérer les erreurs 401', async () => {
            const response = {
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' }),
                headers: new Map(),
            };
            await expect(handleHttpError(response)).rejects.toThrow(AuthenticationError);
        });

        it('devrait gérer les erreurs 429 avec retry-after', async () => {
            const headers = new Map([['retry-after', '30']]);
            const response = {
                status: 429,
                json: () => Promise.resolve({ error: 'Too many requests' }),
                headers: {
                    get: (name) => headers.get(name),
                },
            };
            try {
                await handleHttpError(response);
            } catch (error) {
                expect(error).toBeInstanceOf(RateLimitError);
                expect(error.retryAfter).toBe('30');
            }
        });

        it('devrait gérer les erreurs 500', async () => {
            const response = {
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' }),
                headers: new Map(),
            };
            await expect(handleHttpError(response)).rejects.toThrow(ServerError);
        });

        it('devrait gérer les erreurs de parsing JSON', async () => {
            const response = {
                status: 500,
                json: () => Promise.reject(new Error('Invalid JSON')),
                headers: new Map(),
            };
            await expect(handleHttpError(response)).rejects.toThrow(ServerError);
        });

        it('devrait gérer les erreurs inconnues', async () => {
            const response = {
                status: 418,
                json: () => Promise.resolve({ error: 'Unknown error' }),
                headers: new Map(),
            };
            await expect(handleHttpError(response)).rejects.toThrow('Unknown error');
        });
    });

    describe('logError', () => {
        it("devrait logger les détails de l'erreur", () => {
            const error = new Error('Test error');
            error.name = 'TestError';
            error.status = 500;
            error.code = 'TEST_ERROR';
            error.timestamp = new Date().toISOString();

            logError(error);

            expect(console.error).toHaveBeenCalledWith(
                'API Error:',
                expect.objectContaining({
                    name: 'TestError',
                    message: 'Test error',
                    status: 500,
                    code: 'TEST_ERROR',
                    timestamp: expect.any(String),
                    stack: expect.any(String),
                })
            );
        });

        it('devrait gérer les erreurs sans propriétés optionnelles', () => {
            const error = new Error('Simple error');

            logError(error);

            expect(console.error).toHaveBeenCalledWith(
                'API Error:',
                expect.objectContaining({
                    name: 'Error',
                    message: 'Simple error',
                    stack: expect.any(String),
                })
            );
        });
    });
});
