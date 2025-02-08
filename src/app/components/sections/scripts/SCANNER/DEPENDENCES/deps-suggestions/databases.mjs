// Suggestions de dépendances pour les bases de données
export const databaseDeps = {
    'mongoose': {
        category: 'Bases de données',
        description: 'ODM MongoDB élégant',
        useCases: [
            'Modélisation données',
            'Validation schémas',
            'Middleware',
            'Population',
            'Transactions'
        ],
        type: 'prod'
    },
    'sequelize': {
        category: 'Bases de données',
        description: 'ORM SQL multi-dialecte',
        useCases: [
            'Modèles SQL',
            'Migrations',
            'Relations',
            'Transactions',
            'Multi-base'
        ],
        type: 'prod'
    },
    'prisma': {
        category: 'Bases de données',
        description: 'ORM nouvelle génération',
        useCases: [
            'Type-safety',
            'Migrations auto',
            'Studio GUI',
            'Multi-provider',
            'Performance'
        ],
        type: 'prod'
    },
    'typeorm': {
        category: 'Bases de données',
        description: 'ORM TypeScript avancé',
        useCases: [
            'Décorateurs',
            'Relations',
            'Migrations',
            'Multi-base',
            'Repository'
        ],
        type: 'prod'
    },
    'redis': {
        category: 'Bases de données',
        description: 'Client Redis moderne',
        useCases: [
            'Cache',
            'Pub/Sub',
            'Sessions',
            'Rate limiting',
            'Queues'
        ],
        type: 'prod'
    },
    'ioredis': {
        category: 'Bases de données',
        description: 'Client Redis robuste',
        useCases: [
            'Cluster',
            'Sentinel',
            'Lua scripting',
            'Pipeline',
            'Transactions'
        ],
        type: 'prod'
    },
    'pg': {
        category: 'Bases de données',
        description: 'Client PostgreSQL non-bloquant',
        useCases: [
            'Requêtes SQL',
            'Paramètres',
            'Notifications',
            'Types custom',
            'Pool connexions'
        ],
        type: 'prod'
    },
    'mongodb': {
        category: 'Bases de données',
        description: 'Driver MongoDB officiel',
        useCases: [
            'CRUD natif',
            'Agrégation',
            'Change streams',
            'Transactions',
            'GridFS'
        ],
        type: 'prod'
    }
}; 