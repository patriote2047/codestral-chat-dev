// Suggestions de dépendances pour les serveurs et middleware
export const serverDeps = {
    'express': {
        category: 'Serveurs',
        description: 'Framework web rapide et minimaliste',
        useCases: [
            'APIs REST',
            'Applications web',
            'Middleware',
            'Routage',
            'Gestion statique'
        ],
        type: 'prod'
    },
    'fastify': {
        category: 'Serveurs',
        description: 'Framework web haute performance',
        useCases: [
            'APIs rapides',
            'Validation de schéma',
            'Plugins extensibles',
            'Logging intégré',
            'Support TypeScript'
        ],
        type: 'prod'
    },
    'koa': {
        category: 'Serveurs',
        description: 'Framework web nouvelle génération',
        useCases: [
            'Middleware moderne',
            'Gestion d\'erreurs élégante',
            'API minimaliste',
            'Composabilité',
            'Async/await natif'
        ],
        type: 'prod'
    },
    'cors': {
        category: 'Serveurs',
        description: 'Middleware CORS pour Express',
        useCases: [
            'Configuration CORS',
            'Sécurité API',
            'Contrôle d\'accès',
            'Headers personnalisés',
            'Préflighting'
        ],
        type: 'prod'
    },
    'helmet': {
        category: 'Serveurs',
        description: 'Sécurité pour Express',
        useCases: [
            'Headers sécurité',
            'Protection XSS',
            'CSP',
            'HSTS',
            'Clickjacking'
        ],
        type: 'prod'
    },
    'body-parser': {
        category: 'Serveurs',
        description: 'Parsing du corps des requêtes',
        useCases: [
            'JSON parsing',
            'URL-encoded parsing',
            'Raw body',
            'Multipart',
            'Streaming'
        ],
        type: 'prod'
    },
    'morgan': {
        category: 'Serveurs',
        description: 'Middleware de logging HTTP',
        useCases: [
            'Logs requêtes',
            'Formats personnalisés',
            'Rotation logs',
            'Filtrage',
            'Tokens custom'
        ],
        type: 'prod'
    },
    'serve-static': {
        category: 'Serveurs',
        description: 'Serveur de fichiers statiques',
        useCases: [
            'Fichiers statiques',
            'Cache-Control',
            'Dotfiles',
            'Index files',
            'Ranges'
        ],
        type: 'prod'
    }
}; 