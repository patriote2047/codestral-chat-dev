'use client';

export const displayCommandDescriptions = () => {
    const descriptions = {
        'dev': {
            description: 'Lance le serveur de développement',
            details: `Le serveur de développement permet de travailler sur l'application avec:
- Rechargement à chaud (Hot Module Replacement)
- Compilation automatique
- Gestion des erreurs en temps réel`,
            examples: [
                'npm run dev',
                'npm run dev -- --port 8000'
            ]
        },
        'build': {
            description: 'Compile le projet pour la production',
            details: `Crée une version optimisée pour la production avec:
- Minification du code
- Optimisation des assets
- Génération des sourcemaps`,
            examples: [
                'npm run build',
                'npm run build -- --analyze'
            ]
        },
        'test': {
            description: 'Lance la suite de tests',
            details: `Exécute les tests avec:
- Tests unitaires
- Tests d'intégration
- Couverture de code`,
            examples: [
                'npm test',
                'npm test -- --watch'
            ]
        }
    };

    return {
        type: 'success',
        title: 'Descriptions des Commandes',
        subtitle: 'Documentation détaillée avec exemples',
        content: formatDescriptionOutput(descriptions),
        metadata: {
            timestamp: new Date().toISOString(),
            totalCommands: Object.keys(descriptions).length
        }
    };
};

const formatDescriptionOutput = (descriptions) => {
    const content = [];
    
    content.push({ type: 'text', text: '\nDescriptions détaillées des commandes' });
    content.push({ type: 'separator' });

    for (const [command, details] of Object.entries(descriptions)) {
        // Nom de la commande et description courte
        content.push({
            type: 'command',
            name: command,
            description: details.description
        });

        // Détails
        if (details.details) {
            content.push({ 
                type: 'text',
                text: '\nDétails:'
            });
            content.push({ 
                type: 'details',
                text: details.details
            });
        }

        // Exemples
        if (details.examples && details.examples.length > 0) {
            content.push({ 
                type: 'text',
                text: '\nExemples:'
            });
            details.examples.forEach(example => {
                content.push({
                    type: 'example',
                    command: example
                });
            });
        }

        content.push({ type: 'separator' });
    }

    return content;
}; 