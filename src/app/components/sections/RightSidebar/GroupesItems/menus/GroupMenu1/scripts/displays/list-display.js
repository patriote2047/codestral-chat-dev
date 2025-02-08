'use client';

import styles from './list-display.module.css';

// Icônes pour les catégories
const CATEGORY_ICONS = {
    'Framework & Core': '⚛️',
    'Build & Compilation': '🔨',
    'Tests & Qualité': '🧪',
    'Utilitaires': '🔧',
    'Développement': '🛠️',
    'Autres': '📦'
};

// Badge pour le type de dépendance
const TYPE_BADGES = {
    dependency: { label: 'Production', color: 'var(--theme-success)' },
    devDependency: { label: 'Développement', color: 'var(--theme-warning)' }
};

export const formatFullCommandOutput = (dependencies) => {
    return {
        type: 'success',
        content: [
            // En-tête
            {
                type: 'header',
                html: `
                    <div class="${styles['report-header']}">
                        <h1 class="${styles['report-title']}">Dépendances du Projet</h1>
                        <div class="${styles['project-path']}">
                            <span>Liste complète des packages installés et leurs versions</span>
                        </div>
                    </div>
                `
            },

            // Contenu par catégorie
            ...Object.entries(dependencies).map(([category, deps]) => ({
                type: 'category',
                html: `
                    <div class="${styles['category-section']}">
                        <div class="${styles['category-header']}">
                            <span class="${styles['category-icon']}">${CATEGORY_ICONS[category] || '📦'}</span>
                            <span class="${styles['category-title']}">${category}</span>
                            <span class="${styles['category-count']}">${Object.keys(deps).length}</span>
                        </div>
                        <div class="${styles['commands-container']}">
                            ${Object.entries(deps).map(([name, details]) => `
                                <div class="${styles['command-item']}">
                                    <div class="${styles['command-header']}">
                                        <div class="${styles['command-name']}">${name}</div>
                                        <div class="${styles['version-badge']}">${details.version}</div>
                                        <div class="${styles['type-badge']}" style="background-color: ${TYPE_BADGES[details.type].color}">
                                            ${TYPE_BADGES[details.type].label}
                                        </div>
                                    </div>
                                    <div class="${styles['command-description']}">${details.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `
            })),

            // Métadonnées
            {
                type: 'metadata',
                html: `
                    <div class="${styles.metadata}">
                        <div class="${styles['metadata-title']}">Résumé des Dépendances</div>
                        <div class="${styles['metadata-grid']}">
                            <div class="${styles['metadata-item']}">
                                <div class="${styles['metadata-label']}">Total des catégories</div>
                                <div class="${styles['metadata-value']}">${Object.keys(dependencies).length}</div>
                            </div>
                            <div class="${styles['metadata-item']}">
                                <div class="${styles['metadata-label']}">Total des packages</div>
                                <div class="${styles['metadata-value']}">
                                    ${Object.values(dependencies).reduce((acc, cat) => acc + Object.keys(cat).length, 0)}
                                </div>
                            </div>
                            <div class="${styles['metadata-item']}">
                                <div class="${styles['metadata-label']}">Dernière mise à jour</div>
                                <div class="${styles['metadata-value']}">
                                    ${new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                `
            }
        ],
        metadata: {
            timestamp: new Date().toISOString(),
            categories: Object.keys(dependencies).length,
            totalDependencies: Object.values(dependencies).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
        }
    };
}; 