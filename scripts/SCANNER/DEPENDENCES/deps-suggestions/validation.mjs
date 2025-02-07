// Suggestions de dépendances pour la validation et la sanitization
export const validationDeps = {
    'validator': {
        category: 'Validation',
        description: 'Bibliothèque de validation de chaînes',
        useCases: [
            'Validation email',
            'Validation URL',
            'Sanitization',
            'Validation nombres',
            'Validation dates'
        ],
        type: 'prod'
    },
    'joi': {
        category: 'Validation',
        description: 'Validation de schéma puissante',
        useCases: [
            'Validation objets',
            'Types personnalisés',
            'Messages d\'erreur',
            'Conversion types',
            'Validation conditionnelle'
        ],
        type: 'prod'
    },
    'yup': {
        category: 'Validation',
        description: 'Validation de schéma avec TypeScript',
        useCases: [
            'Validation forms',
            'Types TypeScript',
            'Transformations',
            'Messages localisés',
            'Validation async'
        ],
        type: 'prod'
    },
    'zod': {
        category: 'Validation',
        description: 'Validation TypeScript-first',
        useCases: [
            'Validation TypeScript',
            'Inférence types',
            'Parsing',
            'Transformations',
            'Composition'
        ],
        type: 'prod'
    },
    'class-validator': {
        category: 'Validation',
        description: 'Validation basée sur les décorateurs',
        useCases: [
            'Validation classes',
            'Décorateurs TypeScript',
            'Validation imbriquée',
            'Messages personnalisés',
            'Validation async'
        ],
        type: 'prod'
    },
    'sanitize-html': {
        category: 'Validation',
        description: 'Nettoyage HTML sécurisé',
        useCases: [
            'Sanitization HTML',
            'Protection XSS',
            'Filtrage attributs',
            'Whitelist tags',
            'Transformation HTML'
        ],
        type: 'prod'
    },
    'ajv': {
        category: 'Validation',
        description: 'Validateur JSON Schema',
        useCases: [
            'Validation JSON Schema',
            'Performance',
            'Types personnalisés',
            'Formats',
            'Compilation schémas'
        ],
        type: 'prod'
    }
}; 