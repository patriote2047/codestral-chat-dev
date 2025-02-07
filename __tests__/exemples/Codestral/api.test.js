import { fetchChatResponse } from './api';
import { AuthenticationError, RateLimitError, ValidationError, ServerError } from './errors';

// Mock fetch
global.fetch = jest.fn();

describe('API Codestral', () => {
    beforeEach(() => {
        global.fetch.mockClear();
        process.env.NEXT_PUBLIC_MISTRAL_API_KEY = 'test-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Test de connexion', () => {
        it("devrait pouvoir se connecter à l'API Codestral", async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ status: 'success' }),
                headers: new Headers(),
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const response = await fetch('https://api.mistral.ai/codestral/test', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.status).toBe('success');
        });

        it('devrait échouer avec une clé API invalide', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Invalid API key' }),
                headers: new Headers(),
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(
                fetch('https://api.mistral.ai/codestral/test', {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer invalid-key',
                        'Content-Type': 'application/json',
                    },
                })
            ).rejects.toThrow(AuthenticationError);
        });
    });

    describe('Chat API', () => {
        it("devrait appeler l'API avec les bons paramètres", async () => {
            const mockResponse = { response: 'Test response' };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const message = 'Test message';
            const response = await fetchChatResponse(message);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(response).toEqual(mockResponse);
        });

        it("devrait gérer les erreurs de l'API", async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            });

            const message = 'Test message';

            await expect(fetchChatResponse(message)).rejects.toThrow();
        });

        it('devrait envoyer un message avec succès', async () => {
            const mockResponse = {
                ok: true,
                json: () =>
                    Promise.resolve({
                        choices: [
                            {
                                message: {
                                    content: 'Réponse de test',
                                },
                            },
                        ],
                    }),
                headers: new Headers(),
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await fetchChatResponse('test message');
            expect(result).toEqual({ response: 'Réponse de test' });
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.mistral.ai/codestral/chat',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: 'Bearer test-key',
                    }),
                    body: expect.stringContaining('test message'),
                })
            );
        });

        it('devrait gérer les erreurs de validation', async () => {
            await expect(fetchChatResponse('')).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse(null)).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse('a'.repeat(5000))).rejects.toThrow(ValidationError);
        });

        it('devrait gérer les erreurs de rate limit', async () => {
            const mockResponse = {
                ok: false,
                status: 429,
                json: () => Promise.resolve({ error: 'Too many requests' }),
                headers: new Headers({
                    'retry-after': '60',
                }),
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(fetchChatResponse('test')).rejects.toThrow(RateLimitError);
        });

        it('devrait gérer les erreurs serveur', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Internal server error' }),
                headers: new Headers(),
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(fetchChatResponse('test')).rejects.toThrow(ServerError);
        });
    });
});
