// Erreur de base pour l'API Codestral
export class CodestralError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'CodestralError';
        this.status = status;
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

// Erreurs spécifiques
export class ValidationError extends Error {
    constructor(message = 'Validation error') {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends Error {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class RateLimitError extends Error {
    constructor(retryAfter, message = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class TimeoutError extends CodestralError {
    constructor(message = 'La requête a expiré. Veuillez réessayer.') {
        super(message, 408, 'TIMEOUT_ERROR');
    }
}

export class ServerError extends Error {
    constructor(message = 'Internal server error') {
        super(message);
        this.name = 'ServerError';
    }
}

// Gestionnaire d'erreurs HTTP
export function handleHttpError(status, responseData) {
    switch (status) {
        case 400:
            throw new ValidationError(responseData?.error || 'Paramètres de requête invalides');
        case 401:
            throw new AuthenticationError();
        case 403:
            throw new AuthenticationError(
                'Accès refusé. Vérifiez les permissions de votre clé API.'
            );
        case 404:
            throw new CodestralError('Ressource non trouvée', 404, 'NOT_FOUND');
        case 429:
            const retryAfter = responseData?.retry_after || 60;
            throw new RateLimitError(retryAfter);
        case 500:
        case 502:
        case 503:
        case 504:
            throw new ServerError(
                responseData?.error || 'Le service est temporairement indisponible'
            );
        default:
            throw new CodestralError(
                "Une erreur inattendue s'est produite",
                status,
                'UNKNOWN_ERROR'
            );
    }
}

// Constantes pour la gestion des timeouts et retries
export const API_CONSTANTS = {
    TIMEOUT_MS: 30000, // 30 secondes
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY: 1000, // 1 seconde
    MAX_RETRY_DELAY: 10000, // 10 secondes
    RETRY_STATUS_CODES: new Set([408, 429, 500, 502, 503, 504]),
};
