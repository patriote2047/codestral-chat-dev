// Suggestions de dépendances pour le cache et la performance
export const cacheDeps = {
    'node-cache': {
        category: 'Cache',
        description: 'Cache en mémoire simple',
        useCases: [
            'Cache in-memory',
            'TTL automatique',
            'Stats intégrées',
            'Events',
            'Clés multiples'
        ],
        type: 'prod'
    },
    'lru-cache': {
        category: 'Cache',
        description: 'Cache LRU performant',
        useCases: [
            'Cache LRU',
            'Limite taille',
            'TTL items',
            'Cache stats',
            'Custom dispose'
        ],
        type: 'prod'
    },
    'keyv': {
        category: 'Cache',
        description: 'Interface de stockage simple',
        useCases: [
            'Multi-backend',
            'API Promise',
            'TTL support',
            'Namespace',
            'Map API'
        ],
        type: 'prod'
    },
    'memcached': {
        category: 'Cache',
        description: 'Client Memcached',
        useCases: [
            'Distributed cache',
            'High availability',
            'Consistent hashing',
            'Connection pooling',
            'Binary protocol'
        ],
        type: 'prod'
    },
    'cache-manager': {
        category: 'Cache',
        description: 'Gestionnaire de cache flexible',
        useCases: [
            'Multi-store',
            'Cache hierarchy',
            'TTL management',
            'Cache clearing',
            'Custom stores'
        ],
        type: 'prod'
    },
    'quick-lru': {
        category: 'Cache',
        description: 'Cache LRU minimaliste',
        useCases: [
            'Cache simple',
            'Performance',
            'Taille fixe',
            'Iterable',
            'ES6 Map'
        ],
        type: 'prod'
    }
}; 