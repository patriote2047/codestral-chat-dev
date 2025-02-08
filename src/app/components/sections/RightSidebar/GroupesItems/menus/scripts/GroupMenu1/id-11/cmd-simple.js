'use client';

import { useProjectPath } from '@/app/hooks/useProjectPath';
import { useState } from 'react';

// Catégories de commandes
const commandCategories = {
    'Groupes': {
        pattern: /^(test:full|dev:managed)/,
        icon: '▼',
        groups: {
            'test:full': {
                description: 'Suite complète de tests',
                commands: ['test', 'test:check-missing']
            },
            'dev:managed': {
                description: 'Démarrage géré avec dev-server.js',
                commands: ['dev', 'check:deps', 'list:config']
            }
        }
    },
    'Développement': {
        pattern: /^dev/,
        icon: '▼'
    },
    'Tests': {
        pattern: /^test/,
        icon: '▼'
    },
    'Linting': {
        pattern: /^(lint|format|validate)/,
        icon: '▼'
    }
};

// Descriptions courtes des commandes
const commandDescriptions = {
    'add:command:desc': 'Ajouter une description dans la console',
    'build': 'Build production',
    'check:deps': 'Analyse dépendances',
    'clean': 'Nettoyage build',
    'clean:all': 'Nettoyage complet',
    'dev': 'Serveur de développement',
    'dev:managed': 'Serveur géré (dev-server.js)',
    'dev:watch': 'Serveur avec rechargement auto'
};

export default function CmdSimple({ onResult }) {
    const { projectPath, isLoading, error } = useProjectPath();
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!projectPath) {
            onResult({
                type: 'error',
                content: 'Veuillez d\'abord sélectionner un dossier projet'
            });
            return;
        }

        try {
            setAnalyzing(true);
            
            // Formater les résultats pour l'affichage
            const content = [];

            // Ajouter le titre
            content.push({ type: 'text', text: '\nListe des commandes disponibles' });
            content.push({ type: 'separator' });

            // Afficher d'abord les groupes
            content.push({ type: 'category', icon: '▼', text: 'Groupes' });
            Object.entries(commandCategories.Groupes.groups).forEach(([command, info]) => {
                content.push({
                    type: 'command',
                    name: command,
                    description: info.description
                });
                content.push({
                    type: 'subCommand',
                    commands: info.commands
                });
            });

            // Afficher les autres catégories
            for (const [category, info] of Object.entries(commandCategories)) {
                if (category === 'Groupes') continue;
                
                content.push({ type: 'category', icon: info.icon, text: category });
                Object.entries(commandDescriptions)
                    .filter(([cmd]) => info.pattern.test(cmd))
                    .forEach(([cmd, desc]) => {
                        content.push({
                            type: 'command',
                            name: cmd,
                            description: desc
                        });
                    });
            }

            content.push({ type: 'separator' });
            content.push({ 
                type: 'text', 
                text: `${Object.keys(commandDescriptions).length} commandes au total\n`
            });

            // Envoyer les résultats au Preview
            onResult({
                type: 'success',
                title: 'Liste des Commandes',
                subtitle: 'Vue simplifiée des commandes disponibles',
                content,
                metadata: {
                    projectPath,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Erreur:', error);
            onResult({
                type: 'error',
                content: error.message
            });
        } finally {
            setAnalyzing(false);
        }
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

    return (
        <div>
            <h2>Liste des Commandes</h2>
            <p>Affiche la liste des commandes disponibles de manière simplifiée.</p>
            <button 
                onClick={handleAnalyze}
                disabled={analyzing}
            >
                {analyzing ? 'Analyse en cours...' : 'Afficher les commandes'}
            </button>
        </div>
    );
} 