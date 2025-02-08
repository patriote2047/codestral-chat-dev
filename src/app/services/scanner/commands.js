import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Lit et analyse le fichier package.json du projet
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} Informations sur les scripts du package.json
 */
export const getProjectCommands = (projectPath) => {
    try {
        const packageJsonPath = join(projectPath, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
            return {
                type: 'error',
                content: 'Aucun script trouvé dans le package.json'
            };
        }

        const scripts = packageJson.scripts;
        const scriptCount = Object.keys(scripts).length;

        const content = [
            {
                type: 'text',
                text: `Projet : ${projectPath}`
            },
            {
                type: 'text',
                text: `${scriptCount} commande${scriptCount > 1 ? 's' : ''} trouvée${scriptCount > 1 ? 's' : ''}`
            },
            { type: 'separator' }
        ];

        // Catégorisation des commandes
        const categories = {
            'Production': ['start', 'build', 'serve'],
            'Développement': ['dev', 'develop', 'watch'],
            'Test': ['test', 'test:unit', 'test:e2e', 'test:coverage'],
            'Qualité': ['lint', 'format', 'prettier'],
            'Utilitaire': ['clean', 'prebuild', 'postbuild']
        };

        // Trier les commandes par catégorie
        const categorizedScripts = {};
        Object.entries(scripts).forEach(([name, command]) => {
            let found = false;
            for (const [category, patterns] of Object.entries(categories)) {
                if (patterns.some(pattern => name.includes(pattern))) {
                    if (!categorizedScripts[category]) {
                        categorizedScripts[category] = [];
                    }
                    categorizedScripts[category].push({ name, command });
                    found = true;
                    break;
                }
            }
            if (!found) {
                if (!categorizedScripts['Autres']) {
                    categorizedScripts['Autres'] = [];
                }
                categorizedScripts['Autres'].push({ name, command });
            }
        });

        // Ajouter les commandes catégorisées au contenu
        Object.entries(categorizedScripts).forEach(([category, scripts]) => {
            content.push({
                type: 'category',
                text: category,
                icon: getCategoryIcon(category)
            });

            scripts.forEach(({ name, command }) => {
                content.push({
                    type: 'command',
                    name,
                    description: command
                });

                // Ajouter les sous-commandes si présentes
                const subCommands = command.split('&&').map(cmd => cmd.trim());
                if (subCommands.length > 1) {
                    content.push({
                        type: 'subCommand',
                        commands: subCommands
                    });
                }
            });
        });

        return {
            type: 'success',
            title: 'Commandes du projet',
            subtitle: `${scriptCount} commande${scriptCount > 1 ? 's' : ''} disponible${scriptCount > 1 ? 's' : ''}`,
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                projectPath
            }
        };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {
                type: 'error',
                content: 'Aucun fichier package.json trouvé dans le projet'
            };
        }
        return {
            type: 'error',
            content: `Erreur lors de la lecture du package.json : ${error.message}`
        };
    }
};

/**
 * Retourne l'icône correspondant à la catégorie
 * @param {string} category - Nom de la catégorie
 * @returns {string} Icône de la catégorie
 */
const getCategoryIcon = (category) => {
    const icons = {
        'Production': '🚀',
        'Développement': '🛠️',
        'Test': '🧪',
        'Qualité': '✨',
        'Utilitaire': '🔧',
        'Autres': '📦'
    };
    return icons[category] || '📦';
}; 