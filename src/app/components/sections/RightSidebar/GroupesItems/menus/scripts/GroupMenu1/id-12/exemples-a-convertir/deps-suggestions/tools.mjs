// Suggestions de dépendances pour les outils de développement
export const toolsDeps = {
    'chalk': {
        category: 'Tools',
        description: 'Styling de terminal',
        useCases: [
            'Coloration console',
            'Styles texte',
            'Logging formaté',
            'CLI design',
            'Debug visuel'
        ],
        type: 'prod'
    },
    'glob': {
        category: 'Tools',
        description: 'Pattern matching de fichiers',
        useCases: [
            'Recherche fichiers',
            'Filtrage patterns',
            'Build tools',
            'Scripts automation',
            'File processing'
        ],
        type: 'dev'
    },
    'husky': {
        category: 'Tools',
        description: 'Git hooks faciles',
        useCases: [
            'Pre-commit hooks',
            'Commit message',
            'Lint staged',
            'Tests automatiques',
            'Quality checks'
        ],
        type: 'dev'
    },
    'nodemon': {
        category: 'Tools',
        description: 'Rechargement automatique',
        useCases: [
            'Development watch',
            'Auto restart',
            'File monitoring',
            'Extensions support',
            'Custom scripts'
        ],
        type: 'dev'
    },
    'npm-check-updates': {
        category: 'Tools',
        description: 'Gestionnaire de mises à jour',
        useCases: [
            'Version check',
            'Package update',
            'Interactive update',
            'Version filtering',
            'Target version'
        ],
        type: 'dev'
    },
    'npm-run-all': {
        category: 'Tools',
        description: 'Exécution de scripts npm',
        useCases: [
            'Parallel scripts',
            'Sequential scripts',
            'Pattern matching',
            'Cross-platform',
            'Error handling'
        ],
        type: 'dev'
    },
    'rimraf': {
        category: 'Tools',
        description: 'Suppression récursive',
        useCases: [
            'Clean builds',
            'Remove directories',
            'Cross-platform',
            'Glob support',
            'Force delete'
        ],
        type: 'dev'
    },
    '@commitlint/cli': {
        category: 'Tools',
        description: 'Linting des commits',
        useCases: [
            'Commit messages',
            'Convention check',
            'Git hooks',
            'Team standards',
            'CI integration'
        ],
        type: 'dev'
    },
    '@commitlint/config-conventional': {
        category: 'Tools',
        description: 'Config commitlint standard',
        useCases: [
            'Conventional commits',
            'Semantic versioning',
            'Release notes',
            'Changelog',
            'Standard rules'
        ],
        type: 'dev'
    }
}; 