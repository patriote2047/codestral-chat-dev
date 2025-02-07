import {
    TimeoutError,
    API_CONSTANTS,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    ServerError,
} from './errors';

// Fonction pour attendre un certain temps
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fonction pour calculer le délai de retry avec backoff exponentiel
export const calculateRetryDelay = (attempt) => {
    const baseDelay = API_CONSTANTS.INITIAL_RETRY_DELAY;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Ajoute jusqu'à 1 seconde de jitter
    return Math.min(exponentialDelay + jitter, API_CONSTANTS.MAX_RETRY_DELAY);
};

const DEFAULT_TIMEOUT = 30000; // 30 secondes

export function withTimeout(promise, ms = DEFAULT_TIMEOUT) {
    const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error('Request timed out'));
        }, ms);
    });

    return Promise.race([promise, timeout]);
}

export async function handleHttpError(response) {
    const errorData = await response.json().catch(() => ({}));
    const retryAfter = response.headers?.get('retry-after');

    switch (response.status) {
        case 400:
            throw new ValidationError(errorData.error || 'Invalid request parameters');
        case 401:
            throw new AuthenticationError(errorData.error || 'Invalid API key');
        case 429:
            throw new RateLimitError(retryAfter, errorData.error || 'Too many requests');
        case 500:
            throw new ServerError(errorData.error || 'Internal server error');
        default:
            throw new Error(errorData.error || 'An unexpected error occurred');
    }
}

// Fonction pour logger les erreurs
export const logError = (error) => {
    const errorDetails = {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
        timestamp: error.timestamp,
        stack: error.stack,
    };

    console.error('API Error:', errorDetails);

    // Ici, vous pourriez ajouter une logique pour envoyer l'erreur
    // à un service de monitoring comme Sentry
};
