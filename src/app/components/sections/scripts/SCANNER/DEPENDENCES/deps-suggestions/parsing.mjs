// Suggestions de dépendances pour le parsing et la manipulation
export const parsingDeps = {
    'cheerio': {
        category: 'Parsing',
        description: 'jQuery pour le serveur',
        useCases: [
            'Parsing HTML',
            'Scraping web',
            'Manipulation DOM',
            'Sélecteurs CSS',
            'Transformation HTML'
        ],
        type: 'prod'
    },
    'pdf-lib': {
        category: 'Parsing',
        description: 'Création et modification de PDF',
        useCases: [
            'Création PDF',
            'Modification PDF',
            'Formulaires PDF',
            'Encryption',
            'Métadonnées'
        ],
        type: 'prod'
    },
    'csv-parse': {
        category: 'Parsing',
        description: 'Parser CSV performant',
        useCases: [
            'Parsing CSV',
            'Streaming',
            'Options avancées',
            'Transformation',
            'Gestion erreurs'
        ],
        type: 'prod'
    },
    'xml2js': {
        category: 'Parsing',
        description: 'Parser XML simple et robuste',
        useCases: [
            'Parsing XML',
            'Conversion JSON',
            'Namespaces',
            'Validation',
            'Builder XML'
        ],
        type: 'prod'
    },
    'yaml': {
        category: 'Parsing',
        description: 'Parser et générateur YAML',
        useCases: [
            'Parsing YAML',
            'Génération YAML',
            'Schémas custom',
            'Types personnalisés',
            'Multi-document'
        ],
        type: 'prod'
    },
    'markdown-it': {
        category: 'Parsing',
        description: 'Parser Markdown moderne',
        useCases: [
            'Parsing Markdown',
            'Plugins extensibles',
            'Syntaxe GFM',
            'HTML sanitisé',
            'Règles personnalisées'
        ],
        type: 'prod'
    },
    'json5': {
        category: 'Parsing',
        description: 'JSON pour humains',
        useCases: [
            'JSON avec commentaires',
            'Trailing commas',
            'Multi-ligne strings',
            'Quotes optionnelles',
            'Parsing souple'
        ],
        type: 'prod'
    }
}; 