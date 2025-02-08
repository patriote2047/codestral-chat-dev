// Suggestions de dépendances pour la compression et la performance
export const compressionDeps = {
    'compression': {
        category: 'Compression',
        description: 'Middleware de compression',
        useCases: [
            'Compression gzip',
            'Compression dynamique',
            'Filtrage par type',
            'Seuil configurable',
            'Support brotli'
        ],
        type: 'prod'
    },
    'sharp': {
        category: 'Compression',
        description: 'Traitement d\'images haute performance',
        useCases: [
            'Redimensionnement images',
            'Conversion formats',
            'Optimisation images',
            'Rotation et recadrage',
            'Watermarking'
        ],
        type: 'prod'
    },
    'node-gzip': {
        category: 'Compression',
        description: 'Compression gzip pour Node.js',
        useCases: [
            'Compression de données',
            'Optimisation de transfert',
            'Réduction taille réponses',
            'API Promise native',
            'Performance optimisée'
        ],
        type: 'prod'
    },
    'zlib': {
        category: 'Compression',
        description: 'Module de compression natif Node.js',
        useCases: [
            'Compression/décompression',
            'Streaming',
            'Multiple formats',
            'Performance native',
            'Intégration Node.js'
        ],
        type: 'prod'
    },
    'imagemin': {
        category: 'Compression',
        description: 'Optimisation d\'images',
        useCases: [
            'Minification images',
            'Support multiple formats',
            'Plugins extensibles',
            'CLI et API',
            'Integration build'
        ],
        type: 'prod'
    }
}; 