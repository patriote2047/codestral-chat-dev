'use client';

export const displayFullCommandList = () => {
    const commands = {
        'Développement': {
            'dev': {
                description: 'Lance le serveur de développement',
                options: {
                    '--port': 'Port du serveur (défaut: 3000)',
                    '--host': 'Hôte du serveur (défaut: localhost)'
                }
            },
            'dev:watch': {
                description: 'Lance le serveur avec rechargement automatique',
                options: {
                    '--ignore': 'Fichiers à ignorer',
                    '--delay': 'Délai de rechargement (ms)'
                }
            },
            'dev:managed': {
                description: 'Lance le serveur en mode géré',
                options: {
                    '--config': 'Fichier de configuration',
                    '--env': 'Environnement'
                }
            }
        },
        'Tests': {
            'test': {
                description: 'Lance les tests unitaires',
                options: {
                    '--watch': 'Mode watch',
                    '--coverage': 'Rapport de couverture'
                }
            },
            'test:e2e': {
                description: 'Lance les tests end-to-end',
                options: {
                    '--browser': 'Navigateur à utiliser',
                    '--headless': 'Mode headless'
                }
            }
        },
        'Build': {
            'build': {
                description: 'Compile le projet pour la production',
                options: {
                    '--analyze': 'Analyse de bundle',
                    '--minify': 'Minification'
                }
            },
            'build:docs': {
                description: 'Génère la documentation',
                options: {
                    '--output': 'Dossier de sortie',
                    '--format': 'Format de sortie'
                }
            }
        }
    };

    return {
        type: 'success',
        title: 'Liste Complète des Commandes',
        subtitle: 'Documentation détaillée de toutes les commandes disponibles',
        content: formatFullCommandOutput(commands),
        metadata: {
            timestamp: new Date().toISOString(),
            totalCommands: Object.values(commands).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
        }
    };
};

const formatFullCommandOutput = (commands) => {
    const content = [];
    
    content.push({ type: 'text', text: '\nDocumentation complète des commandes' });
    content.push({ type: 'separator' });

    for (const [category, categoryCommands] of Object.entries(commands)) {
        content.push({ type: 'category', icon: '▼', text: category });
        
        for (const [command, details] of Object.entries(categoryCommands)) {
            content.push({
                type: 'command',
                name: command,
                description: details.description
            });

            if (details.options) {
                content.push({ type: 'text', text: 'Options:' });
                for (const [option, optionDesc] of Object.entries(details.options)) {
                    content.push({
                        type: 'option',
                        name: option,
                        description: optionDesc
                    });
                }
            }
            
            content.push({ type: 'separator' });
        }
    }

    return content;
}; 