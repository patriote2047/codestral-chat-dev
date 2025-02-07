// Import des extensions Jest
import '@testing-library/jest-dom';
import { expect, jest } from '@jest/globals';

// Configuration globale pour les tests
global.fetch = jest.fn();
global.Headers = jest.fn(() => ({}));

// Configuration de l'environnement de test
process.env = {
    ...process.env,
    NEXT_PUBLIC_MISTRAL_API_KEY: 'test-key',
};

// Configuration des timeouts
jest.setTimeout(10000);

// Réinitialisation des mocks après chaque test
afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    if (jest.isMockFunction(setTimeout)) {
        jest.useRealTimers();
    }
});

// Configuration des matchers personnalisés
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false,
            };
        }
    },
});

// Mock de la classe Request pour Next.js
class MockRequest {
    constructor() {
        return {
            headers: new Map(),
            url: 'http://localhost:3000',
        };
    }
}

// Mock de la classe Response pour Next.js
class MockResponse {
    constructor(body, init) {
        return {
            ...init,
            json: () => Promise.resolve(body),
            text: () => Promise.resolve(JSON.stringify(body)),
            headers: new Map(),
        };
    }
}

global.Request = MockRequest;
global.Response = MockResponse;

// Mock de fetch si nécessaire
if (!global.fetch) {
    global.fetch = jest.fn();
}

// Mock de console.error et console.log pour les tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
    console.error = jest.fn();
    console.log = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
});
