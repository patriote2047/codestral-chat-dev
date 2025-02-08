// Suggestions de dépendances pour le build et la transpilation
export const buildDeps = {
    '@babel/core': {
        category: 'Build',
        description: 'Compilateur JavaScript moderne',
        useCases: [
            'Transpilation ES6+',
            'Support fonctionnalités modernes',
            'Transformation code',
            'Plugins personnalisés',
            'Build production'
        ],
        type: 'dev'
    },
    '@babel/parser': {
        category: 'Build',
        description: 'Parser JavaScript pour Babel',
        useCases: [
            'Analyse code source',
            'Génération AST',
            'Support TypeScript',
            'Support JSX',
            'Parsing modules'
        ],
        type: 'dev'
    },
    '@babel/preset-env': {
        category: 'Build',
        description: 'Preset Babel intelligent',
        useCases: [
            'Ciblage navigateurs',
            'Polyfills automatiques',
            'Modules ES6',
            'Optimisation bundle',
            'Configuration moderne'
        ],
        type: 'dev'
    },
    '@babel/preset-react': {
        category: 'Build',
        description: 'Preset Babel pour React',
        useCases: [
            'Compilation JSX',
            'Support React moderne',
            'Optimisations',
            'Development tools',
            'Hot reloading'
        ],
        type: 'dev'
    },
    '@babel/preset-typescript': {
        category: 'Build',
        description: 'Preset Babel pour TypeScript',
        useCases: [
            'Compilation TypeScript',
            'Type stripping',
            'Support JSX',
            'Const enums',
            'Namespace support'
        ],
        type: 'dev'
    },
    '@babel/types': {
        category: 'Build',
        description: 'Définitions de types AST Babel',
        useCases: [
            'Manipulation AST',
            'Validation noeuds',
            'Construction AST',
            'Types TypeScript',
            'Utilitaires AST'
        ],
        type: 'dev'
    }
}; 