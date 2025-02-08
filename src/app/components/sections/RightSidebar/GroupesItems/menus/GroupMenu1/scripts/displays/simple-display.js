'use client';

import styles from './simple-display.module.css';

// Icônes SVG pour les catégories
const CATEGORY_ICONS = {
    'Développement': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>`,
    'Production': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>`,
    'Test': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"/>
    </svg>`,
    'Qualité': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>`,
    'Utilitaire': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>`,
    'Autres': `<svg class="${styles['category-icon']}" viewBox="0 0 24 24">
        <path class="${styles['icon-path']}" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
    </svg>`
};

export const formatCommandsReport = (projectPath, categorizedCommands, totalCommands) => {
    return {
        type: 'success',
        content: [
            // En-tête avec chemin du projet
            {
                type: 'header',
                html: `
                    <div class="${styles['report-header']}">
                        <h1 class="${styles['report-title']}">Commandes du Package.json</h1>
                        <div class="${styles['project-path']}">
                            <span class="${styles['path-label']}">Chemin:</span>
                            <span class="${styles['path-value']}">${projectPath}</span>
                        </div>
                    </div>
                `
            },

            // Catégories et leurs commandes
            ...Object.entries(categorizedCommands).map(([category, commands]) => ({
                type: 'category',
                html: `
                    <div class="${styles.categoryWrapper}">
                        <div class="${styles.categoryHeader}">
                            ${CATEGORY_ICONS[category] || CATEGORY_ICONS['Autres']}
                            <span class="${styles['category-title']}">${category}</span>
                            <span class="${styles['category-count']}">${commands.length}</span>
                        </div>
                        <div class="${styles.categoryContainer}">
                            ${commands.map(cmd => `
                                <div class="${styles['command-item']}">
                                    <div class="${styles['command-header']}">
                                        <span class="${styles['command-name']}">${cmd.name}</span>
                                        <code class="${styles['command-value']}">${cmd.command}</code>
                                    </div>
                                    ${cmd.description ? `<p class="${styles['command-description']}">${cmd.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `
            })),

            // Résumé
            {
                type: 'summary',
                html: `
                    <div class="${styles['report-summary']}">
                        <div class="${styles['summary-item']}">
                            <span class="${styles['summary-label']}">Total des commandes</span>
                            <span class="${styles['summary-value']}">${totalCommands}</span>
                        </div>
                        <div class="${styles['summary-item']}">
                            <span class="${styles['summary-label']}">Nombre de catégories</span>
                            <span class="${styles['summary-value']}">${Object.keys(categorizedCommands).length}</span>
                        </div>
                    </div>
                `
            }
        ],
        metadata: {
            timestamp: new Date().toISOString(),
            projectPath,
            totalCommands,
            categories: Object.keys(categorizedCommands).length
        }
    };
}; 