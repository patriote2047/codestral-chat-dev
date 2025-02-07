import { fetchChatResponse } from './api';
import { ValidationError } from './errors';

describe('API Functions', () => {
    describe('fetchChatResponse', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
            console.log = jest.fn();
            console.error = jest.fn();
        });

        it('devrait simuler une conversation complète', async () => {
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'La capitale de la France est Paris.',
                        },
                    },
                ],
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await fetchChatResponse('Quelle est la capitale de la France ?');

            expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: 'Quelle est la capitale de la France ?',
                        },
                    ],
                }),
            });

            expect(result).toEqual({
                response: 'La capitale de la France est Paris.',
            });
        });

        it("devrait gérer les erreurs d'authentification", async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Clé API invalide' }),
            });

            await expect(fetchChatResponse('Test message')).rejects.toThrow('Clé API invalide');
        });

        it('devrait gérer les erreurs de limite de taux', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                json: () => Promise.resolve({ error: 'Trop de requêtes' }),
            });

            await expect(fetchChatResponse('Test message')).rejects.toThrow('Trop de requêtes');
        });

        it('devrait gérer les erreurs de serveur', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Erreur serveur interne' }),
            });

            await expect(fetchChatResponse('Test message')).rejects.toThrow(
                'Erreur serveur interne'
            );
        });

        it('devrait gérer les réponses malformées', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ invalid: 'format' }),
            });

            await expect(fetchChatResponse('Test message')).rejects.toThrow(
                'Format de réponse invalide'
            );
        });

        it('devrait gérer les erreurs de validation de message vide', async () => {
            await expect(fetchChatResponse('')).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse('')).rejects.toThrow(
                'Le message doit être une chaîne de caractères non vide'
            );
        });

        it('devrait gérer les erreurs de validation de type de message', async () => {
            await expect(fetchChatResponse(null)).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse(undefined)).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse(123)).rejects.toThrow(ValidationError);
        });

        it('devrait gérer les erreurs de validation de longueur de message', async () => {
            const longMessage = 'a'.repeat(4097);
            await expect(fetchChatResponse(longMessage)).rejects.toThrow(ValidationError);
            await expect(fetchChatResponse(longMessage)).rejects.toThrow(
                'Le message ne doit pas dépasser 4096 caractères'
            );
        });

        it('devrait gérer les erreurs de timeout', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 408,
                json: () => Promise.resolve({ error: 'Le serveur met trop de temps à répondre' }),
            });

            await expect(fetchChatResponse('Test message')).rejects.toThrow(
                'Le serveur met trop de temps à répondre'
            );
        });
    });
});
