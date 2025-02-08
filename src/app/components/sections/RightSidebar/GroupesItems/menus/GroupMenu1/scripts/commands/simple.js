'use client';

import { commonCommands } from '../utils/commonCommands';
import { getProjectPath } from '../utils/getProjectPath';
import { formatCommandsReport } from '../displays/simple-display';

// Constantes pour les catégories
const CATEGORIES = {
    DEVELOPMENT: 'Développement',
    PRODUCTION: 'Production',
    TEST: 'Test',
    QUALITY: 'Qualité',
    UTILITY: 'Utilitaire',
    OTHERS: 'Autres'
};

// Mots-clés pour la catégorisation automatique
const CATEGORY_KEYWORDS = {
    [CATEGORIES.DEVELOPMENT]: ['dev', 'start', 'serve', 'watch'],
    [CATEGORIES.PRODUCTION]: ['build', 'deploy', 'prod'],
    [CATEGORIES.TEST]: ['test', 'jest', 'mocha', 'cypress'],
    [CATEGORIES.QUALITY]: ['lint', 'format', 'prettier', 'eslint'],
    [CATEGORIES.UTILITY]: ['clean', 'clear', 'rimraf', 'prebuild', 'postbuild']
};

// Fonction pour détecter la catégorie basée sur les mots-clés
const detectCategory = (name, command) => {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => 
            name.toLowerCase().includes(keyword) || 
            command.toLowerCase().includes(keyword)
        )) {
            return category;
        }
    }
    return CATEGORIES.OTHERS;
};

// Fonction pour générer une description par défaut
const generateDefaultDescription = (name, command) => {
    const cleanCommand = command.replace(/&&/g, ' et ').replace(/\|\|/g, ' ou ');
    return `Exécute la commande "${cleanCommand}"`;
};

// Fonction pour catégoriser une commande
const categorizeCommand = (name, command, commonCommand) => {
    if (commonCommand) {
        return {
            category: commonCommand.category,
            name,
            description: commonCommand.description,
            command
        };
    }
    
    return {
        category: detectCategory(name, command),
        name,
        description: generateDefaultDescription(name, command),
        command
    };
};

// Fonction pour organiser les commandes par catégorie
const organizeCommandsByCategory = (scripts) => {
    const categorizedCommands = {};
    const existingScripts = Object.keys(scripts);

    // Initialiser toutes les catégories
    Object.values(CATEGORIES).forEach(category => {
        categorizedCommands[category] = [];
    });

    existingScripts.forEach(name => {
        const command = scripts[name];
        const commonCommand = commonCommands[name];
        const commandInfo = categorizeCommand(name, command, commonCommand);

        categorizedCommands[commandInfo.category].push({
            name: commandInfo.name,
            description: commandInfo.description,
            command: commandInfo.command
        });
    });

    // Supprimer les catégories vides
    Object.keys(categorizedCommands).forEach(category => {
        if (categorizedCommands[category].length === 0) {
            delete categorizedCommands[category];
        }
    });

    return {
        commands: categorizedCommands,
        totalCommands: existingScripts.length
    };
};

export const displaySimpleCommandList = async () => {
    try {
        // 1. Récupération du chemin du projet
        const projectPath = await getProjectPath();
        
        // 2. Récupération des scripts du package.json
        const response = await fetch('/api/project/scripts');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la récupération des scripts');
        }

        const { scripts } = await response.json();
        if (!scripts || typeof scripts !== 'object') {
            throw new Error('Aucun script trouvé dans le package.json');
        }

        // 3. Organisation des données
        const { commands, totalCommands } = organizeCommandsByCategory(scripts);

        // 4. Formatage pour l'affichage
        return formatCommandsReport(projectPath, commands, totalCommands);

    } catch (error) {
        return {
            type: 'error',
            content: error.message
        };
    }
}; 