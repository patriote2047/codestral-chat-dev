import { jest } from '@jest/globals';

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body, init) => ({
            json: () => Promise.resolve(body),
            ...init,
        }),
    },
}));

// Mock de la classe Request
global.Request = class {
    constructor() {
        return {};
    }
};

describe('Test de la clé API Codestral', () => {
    let originalFetch;
    let mockFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        process.env.NEXT_PUBLIC_MISTRAL_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
        delete process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    });

    test("devrait tester la connexion à l'API avec succès", async () => {
        const mockResponse = {
            choices: [{ message: { content: 'Test réussi' } }],
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockResponse)),
            status: 200,
            statusText: 'OK',
            headers: new Map(),
        });

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.message).toBe('Clé API valide');
        expect(data.details).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://codestral.mistral.ai/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    Authorization: 'Bearer test-api-key',
                    'Content-Type': 'application/json',
                },
            })
        );
    });

    test('devrait gérer une clé API invalide', async () => {
        const errorResponse = { error: 'Invalid API key' };
        mockFetch.mockResolvedValueOnce({
            ok: false,
            text: () => Promise.resolve(JSON.stringify(errorResponse)),
            status: 401,
            statusText: 'Unauthorized',
            headers: new Map(),
        });

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.error).toBe('Erreur API détaillée');
        expect(data.status).toBe(401);
        expect(data.details).toEqual(errorResponse);
    });

    test('devrait gérer une erreur réseau', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.error).toBe('Network error');
        expect(data.details).toBeDefined();
    });

    test('devrait gérer une réponse API malformée', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('Invalid JSON'),
            status: 200,
            statusText: 'OK',
            headers: new Map(),
        });

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.error).toBeDefined();
        expect(data.details).toBeDefined();
    });

    test("devrait gérer l'absence de clé API", async () => {
        delete process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

        const { GET } = require('./route');
        const response = await GET();
        const data = await response.json();

        expect(data.error).toBe("Clé API non trouvée dans les variables d'environnement");
    });
});
