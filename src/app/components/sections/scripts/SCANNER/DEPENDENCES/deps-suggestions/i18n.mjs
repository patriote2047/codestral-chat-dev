// Suggestions de dépendances pour l'internationalisation
export const i18nDeps = {
    'i18next': {
        category: 'Internationalisation',
        description: 'Framework d\'internationalisation complet',
        useCases: [
            'Traductions',
            'Pluralisation',
            'Interpolation',
            'Namespaces',
            'Backend plugins'
        ],
        type: 'prod'
    },
    'date-fns': {
        category: 'Internationalisation',
        description: 'Utilitaires de date modernes',
        useCases: [
            'Manipulation dates',
            'Formatage i18n',
            'Parsing',
            'Calculs',
            'Timezone'
        ],
        type: 'prod'
    },
    'date-fns-tz': {
        category: 'Internationalisation',
        description: 'Support timezone pour date-fns',
        useCases: [
            'Conversion timezone',
            'Formatage IANA',
            'DST handling',
            'UTC conversion',
            'Format complexe'
        ],
        type: 'prod'
    },
    'intl': {
        category: 'Internationalisation',
        description: 'API d\'internationalisation ECMAScript',
        useCases: [
            'Formatage nombres',
            'Formatage dates',
            'Collation',
            'Pluralisation',
            'Comparaison'
        ],
        type: 'prod'
    },
    'globalize': {
        category: 'Internationalisation',
        description: 'Bibliothèque complète d\'internationalisation',
        useCases: [
            'Formatage nombres',
            'Formatage dates',
            'Messages',
            'Pluralisation',
            'CLDR'
        ],
        type: 'prod'
    },
    'full-icu': {
        category: 'Internationalisation',
        description: 'Support ICU complet pour Node.js',
        useCases: [
            'Locale complète',
            'Collation',
            'Break iteration',
            'Formatage nombres',
            'Support Unicode'
        ],
        type: 'prod'
    }
}; 