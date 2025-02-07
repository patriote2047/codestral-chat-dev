// Suggestions de dépendances pour les frameworks et UI
export const frameworkDeps = {
    'react': {
        category: 'Framework',
        description: 'Bibliothèque UI déclarative',
        useCases: [
            'Composants UI',
            'Virtual DOM',
            'State management',
            'Hooks',
            'Server components'
        ],
        type: 'prod'
    },
    'react-dom': {
        category: 'Framework',
        description: 'Rendu React pour le web',
        useCases: [
            'DOM rendering',
            'Event handling',
            'Server rendering',
            'Hydration',
            'Portals'
        ],
        type: 'prod'
    },
    'next': {
        category: 'Framework',
        description: 'Framework React full-stack',
        useCases: [
            'Server-side rendering',
            'Static generation',
            'API routes',
            'File-system routing',
            'Image optimization'
        ],
        type: 'prod'
    },
    'styled-components': {
        category: 'Framework',
        description: 'CSS-in-JS pour React',
        useCases: [
            'Styles dynamiques',
            'Theming',
            'CSS scoping',
            'Server-side styles',
            'Style composition'
        ],
        type: 'prod'
    }
}; 