// Suggestions de dépendances pour le linting et le formatting
export const lintingDeps = {
    'eslint': {
        category: 'Linting',
        description: 'Linter JavaScript moderne',
        useCases: [
            'Analyse statique',
            'Style guide',
            'Best practices',
            'Plugins extensibles',
            'Auto-fix'
        ],
        type: 'dev'
    },
    'prettier': {
        category: 'Linting',
        description: 'Formateur de code opinioné',
        useCases: [
            'Formatage code',
            'Style consistant',
            'Multi-langages',
            'Integration IDE',
            'Pre-commit hooks'
        ],
        type: 'dev'
    },
    'eslint-config-next': {
        category: 'Linting',
        description: 'Configuration ESLint pour Next.js',
        useCases: [
            'Règles Next.js',
            'React hooks',
            'Accessibilité',
            'Performance',
            'Best practices'
        ],
        type: 'dev'
    },
    'eslint-config-prettier': {
        category: 'Linting',
        description: 'Configuration ESLint pour Prettier',
        useCases: [
            'Désactive règles conflits',
            'Integration Prettier',
            'Style consistant',
            'Multi-parsers',
            'Configuration simple'
        ],
        type: 'dev'
    },
    'eslint-plugin-prettier': {
        category: 'Linting',
        description: 'Plugin ESLint pour Prettier',
        useCases: [
            'Prettier comme règle',
            'Auto-fix',
            'Format on save',
            'Integration IDE',
            'Style guide'
        ],
        type: 'dev'
    },
    'eslint-plugin-react': {
        category: 'Linting',
        description: 'Plugin ESLint pour React',
        useCases: [
            'Règles React',
            'JSX validation',
            'Hooks rules',
            'Props validation',
            'Best practices'
        ],
        type: 'dev'
    },
    'eslint-plugin-react-hooks': {
        category: 'Linting',
        description: 'Plugin ESLint pour React Hooks',
        useCases: [
            'Rules of Hooks',
            'Dependencies array',
            'Performance',
            'Best practices',
            'Bug prevention'
        ],
        type: 'dev'
    },
    '@typescript-eslint/eslint-plugin': {
        category: 'Linting',
        description: 'Plugin ESLint pour TypeScript',
        useCases: [
            'Règles TypeScript',
            'Type checking',
            'Best practices',
            'Code style',
            'Bug prevention'
        ],
        type: 'dev'
    },
    '@typescript-eslint/parser': {
        category: 'Linting',
        description: 'Parser TypeScript pour ESLint',
        useCases: [
            'Parse TypeScript',
            'AST compatible',
            'Type information',
            'ESLint integration',
            'Project support'
        ],
        type: 'dev'
    }
}; 