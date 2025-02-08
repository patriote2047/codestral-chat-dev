// Suggestions de dépendances pour les tests
export const testingDeps = {
    'jest': {
        category: 'Tests',
        description: 'Framework de test JavaScript complet',
        useCases: [
            'Tests unitaires',
            'Tests d\'intégration',
            'Couverture de code',
            'Mocking',
            'Snapshots'
        ],
        type: 'dev'
    },
    '@testing-library/react': {
        category: 'Tests',
        description: 'Utilitaires de test pour React',
        useCases: [
            'Tests de composants',
            'Tests d\'interactions',
            'Rendu virtuel',
            'Event simulation',
            'Assertions DOM'
        ],
        type: 'dev'
    },
    '@testing-library/dom': {
        category: 'Tests',
        description: 'Utilitaires de test DOM',
        useCases: [
            'Sélection éléments',
            'Event firing',
            'Assertions accessibilité',
            'Tests user-centric',
            'Query utilities'
        ],
        type: 'dev'
    },
    '@testing-library/jest-dom': {
        category: 'Tests',
        description: 'Extensions Jest pour le DOM',
        useCases: [
            'Matchers DOM custom',
            'Assertions accessibilité',
            'Tests styles',
            'Tests attributs',
            'Tests classes'
        ],
        type: 'dev'
    },
    'babel-jest': {
        category: 'Tests',
        description: 'Transformateur Babel pour Jest',
        useCases: [
            'Support ES6+',
            'Support TypeScript',
            'Support JSX',
            'Transformation modules',
            'Source maps'
        ],
        type: 'dev'
    },
    'jest-environment-jsdom': {
        category: 'Tests',
        description: 'Environnement JSDOM pour Jest',
        useCases: [
            'Simulation navigateur',
            'Tests DOM',
            'Tests événements',
            'Tests window/document',
            'Tests composants UI'
        ],
        type: 'dev'
    },
    'identity-obj-proxy': {
        category: 'Tests',
        description: 'Proxy pour mocks d\'imports CSS',
        useCases: [
            'Mock CSS modules',
            'Mock fichiers statiques',
            'Tests composants stylés',
            'Import mapping',
            'Jest configuration'
        ],
        type: 'dev'
    }
}; 