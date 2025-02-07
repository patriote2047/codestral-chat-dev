import {
    CodestralError,
    ValidationError,
    AuthenticationError,
    RateLimitError,
    TimeoutError,
    ServerError,
    handleHttpError,
    API_CONSTANTS,
} from './errors';

describe("Classes d'erreur", () => {
    describe('CodestralError', () => {
        it('devrait créer une erreur avec les propriétés correctes', () => {
            const error = new CodestralError('Test error', 400, 'TEST_ERROR');
            expect(error.message).toBe('Test error');
            expect(error.name).toBe('CodestralError');
            expect(error.status).toBe(400);
            expect(error.code).toBe('TEST_ERROR');
            expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        it('devrait étendre Error', () => {
            const error = new CodestralError('Test error');
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('ValidationError', () => {
        it('devrait créer une erreur avec le message par défaut', () => {
            const error = new ValidationError();
            expect(error.message).toBe('Validation error');
            expect(error.name).toBe('ValidationError');
        });

        it('devrait créer une erreur avec un message personnalisé', () => {
            const error = new ValidationError('Custom validation error');
            expect(error.message).toBe('Custom validation error');
        });

        it('devrait étendre Error', () => {
            const error = new ValidationError();
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('AuthenticationError', () => {
        it('devrait créer une erreur avec le message par défaut', () => {
            const error = new AuthenticationError();
            expect(error.message).toBe('Authentication failed');
            expect(error.name).toBe('AuthenticationError');
        });

        it('devrait créer une erreur avec un message personnalisé', () => {
            const error = new AuthenticationError('Custom auth error');
            expect(error.message).toBe('Custom auth error');
        });

        it('devrait étendre Error', () => {
            const error = new AuthenticationError();
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('RateLimitError', () => {
        it('devrait créer une erreur avec le message par défaut et retryAfter', () => {
            const error = new RateLimitError(30);
            expect(error.message).toBe('Rate limit exceeded');
            expect(error.name).toBe('RateLimitError');
            expect(error.retryAfter).toBe(30);
        });

        it('devrait créer une erreur avec un message personnalisé', () => {
            const error = new RateLimitError(60, 'Custom rate limit error');
            expect(error.message).toBe('Custom rate limit error');
            expect(error.retryAfter).toBe(60);
        });

        it('devrait étendre Error', () => {
            const error = new RateLimitError(30);
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('TimeoutError', () => {
        it('devrait créer une erreur avec le message par défaut', () => {
            const error = new TimeoutError();
            expect(error.message).toBe('La requête a expiré. Veuillez réessayer.');
            expect(error.name).toBe('CodestralError');
            expect(error.status).toBe(408);
            expect(error.code).toBe('TIMEOUT_ERROR');
        });

        it('devrait créer une erreur avec un message personnalisé', () => {
            const error = new TimeoutError('Custom timeout error');
            expect(error.message).toBe('Custom timeout error');
        });

        it('devrait étendre CodestralError', () => {
            const error = new TimeoutError();
            expect(error).toBeInstanceOf(CodestralError);
        });
    });

    describe('ServerError', () => {
        it('devrait créer une erreur avec le message par défaut', () => {
            const error = new ServerError();
            expect(error.message).toBe('Internal server error');
            expect(error.name).toBe('ServerError');
        });

        it('devrait créer une erreur avec un message personnalisé', () => {
            const error = new ServerError('Custom server error');
            expect(error.message).toBe('Custom server error');
        });

        it('devrait étendre Error', () => {
            const error = new ServerError();
            expect(error).toBeInstanceOf(Error);
        });
    });
});

describe('handleHttpError', () => {
    it("devrait gérer l'erreur 400", () => {
        expect(() => handleHttpError(400, { error: 'Bad Request' })).toThrow(ValidationError);
    });

    it("devrait gérer l'erreur 401", () => {
        expect(() => handleHttpError(401)).toThrow(AuthenticationError);
    });

    it("devrait gérer l'erreur 403", () => {
        expect(() => handleHttpError(403)).toThrow(AuthenticationError);
        expect(() => handleHttpError(403)).toThrow(
            'Accès refusé. Vérifiez les permissions de votre clé API.'
        );
    });

    it("devrait gérer l'erreur 404", () => {
        expect(() => handleHttpError(404)).toThrow(CodestralError);
        expect(() => handleHttpError(404)).toThrow('Ressource non trouvée');
    });

    it("devrait gérer l'erreur 429 avec retry_after", () => {
        expect(() => handleHttpError(429, { retry_after: 30 })).toThrow(RateLimitError);
        try {
            handleHttpError(429, { retry_after: 30 });
        } catch (error) {
            expect(error.retryAfter).toBe(30);
        }
    });

    it("devrait gérer l'erreur 429 sans retry_after", () => {
        expect(() => handleHttpError(429)).toThrow(RateLimitError);
        try {
            handleHttpError(429);
        } catch (error) {
            expect(error.retryAfter).toBe(60);
        }
    });

    it('devrait gérer les erreurs serveur (500, 502, 503, 504)', () => {
        [500, 502, 503, 504].forEach((status) => {
            expect(() => handleHttpError(status, { error: 'Server Error' })).toThrow(ServerError);
        });
    });

    it('devrait gérer les erreurs inconnues', () => {
        expect(() => handleHttpError(418)).toThrow(CodestralError);
        expect(() => handleHttpError(418)).toThrow("Une erreur inattendue s'est produite");
    });
});

describe('API_CONSTANTS', () => {
    it('devrait avoir les constantes correctes', () => {
        expect(API_CONSTANTS.TIMEOUT_MS).toBe(30000);
        expect(API_CONSTANTS.MAX_RETRIES).toBe(3);
        expect(API_CONSTANTS.INITIAL_RETRY_DELAY).toBe(1000);
        expect(API_CONSTANTS.MAX_RETRY_DELAY).toBe(10000);
        expect(API_CONSTANTS.RETRY_STATUS_CODES).toBeInstanceOf(Set);
        expect(Array.from(API_CONSTANTS.RETRY_STATUS_CODES)).toEqual([
            408, 429, 500, 502, 503, 504,
        ]);
    });
});
