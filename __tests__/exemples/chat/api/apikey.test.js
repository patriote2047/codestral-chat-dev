import { jest } from '@jest/globals';
const { NextResponse } = require('next/server');

describe('Test de la clé API Codestral', () => {
    let originalFetch;
    let mockFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        process.env.NEXT_PUBLIC_MISTRAL_API_KEY = 'Ao09FAJC0aSf3EpFadOabjHN7HqjRnlG';
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    test("devrait tester la connexion à l'API avec succès", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: 'Test réussi' } }] }),
            text: () => Promise.resolve('{"choices":[{"message":{"content":"Test réussi"}}]}'),
            status: 200,
            statusText: 'OK',
        });

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.message).toBe('Clé API valide');
    });

    test('devrait gérer une clé API invalide', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve('{"error":"Invalid API key"}'),
        });

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.error).toBe('Erreur API détaillée');
        expect(data.status).toBe(401);
    });
});
