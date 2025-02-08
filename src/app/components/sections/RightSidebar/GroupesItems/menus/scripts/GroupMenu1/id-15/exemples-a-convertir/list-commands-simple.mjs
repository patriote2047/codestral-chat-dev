import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Catégories de commandes
const commandCategories = {
    'Groupes': {
        pattern: /^(test:full|dev:managed)/,
        description: 'Groupes de commandes composées',
        color: chalk.magenta,
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
        color: chalk.blue
    },
    'Tests': {
        pattern: /^test/,
        color: chalk.magenta
    },
    'Linting': {
        pattern: /^(lint|format|validate)/,
        color: chalk.yellow
    },
    'Build': {
        pattern: /^(build|start)/,
        color: chalk.green
    },
    'Analyse': {
        pattern: /^(list|check):/,
        color: chalk.cyan
    },
    'Dépendances': {
        pattern: /^(deps|update|reinstall)/,
        color: chalk.red
    },
    'Nettoyage': {
        pattern: /^clean/,
        color: chalk.gray
    }
};

// Descriptions courtes des commandes
const commandDescriptions = {
    'add:command:desc': 'Ajouter une description dans la console',
    'build': 'Build production',
    'check:deps': 'Analyse dépendances',
    'clean': 'Nettoyage build',
    'clean:all': 'Nettoyage complet',
    'deps:audit': 'Audit sécurité',
    'deps:check': 'Vérifie mises à jour',
    'deps:update': 'Met à jour deps',
    'dev': 'Serveur de développement',
    'dev:managed': 'Serveur géré (dev-server.js)',
    'dev:watch': 'Serveur avec rechargement auto',
    'format': 'Format du code',
    'lint': 'Lint du code',
    'list:commands': 'Liste détaillée des commandes',
    'list:commands:simple': 'Liste simplifiée des commandes',
    'list:config': 'Liste config',
    'list:deps': 'Liste dépendances',
    'list:dirs': 'Liste répertoires',
    'list:files': 'Liste fichiers',
    'list:functions': 'Liste fonctions',
    'list:lines': 'Compte lignes',
    'list:root': 'Liste racine',
    'prepare': 'Config hooks git',
    'reinstall': 'Réinstallation deps',
    'start': 'Serveur production',
    'test': 'Tests avec couverture',
    'test:check-missing': 'Vérifie fichiers sans tests',
    'test:full': 'Tests complets',
    'test:move': 'Déplace les tests',
    'test:staged': 'Tests fichiers modifiés',
    'type-check': 'Vérification types TS',
    'update': 'Mise à jour complète',
    'validate': 'Validation complète'
};

async function readPackageJson() {
    try {
        const content = await fs.promises.readFile(
            path.join(ROOT_DIR, 'package.json'),
            'utf-8'
        );
        return JSON.parse(content);
    } catch (error) {
        console.error(chalk.red('Erreur lors de la lecture du package.json:'), error);
        return null;
    }
}

function getCommandCategory(command) {
    for (const [category, info] of Object.entries(commandCategories)) {
        if (info.pattern.test(command)) {
            return { category, ...info };
        }
    }
    return {
        category: 'Autres',
        color: chalk.white
    };
}

function formatCommand(command, isGroupCommand = false) {
    const description = commandDescriptions[command] || '';
    const { color } = getCommandCategory(command);
    
    let output = color(command.padEnd(20)) + chalk.gray(description);

    // Si c'est une commande de groupe, ajouter les sous-commandes
    if (isGroupCommand) {
        for (const [_, info] of Object.entries(commandCategories)) {
            if (info.groups && info.groups[command]) {
                output += '\n    ' + chalk.yellow('↳ ') + info.groups[command].commands
                    .map(cmd => chalk.blue(cmd))
                    .join(chalk.gray(' + '));
            }
        }
    }

    return output;
}

async function displaySimpleCommandList() {
    console.log(chalk.blue('\nListe des commandes disponibles'));
    console.log(chalk.gray('─'.repeat(50)));

    const pkgJson = await readPackageJson();
    if (!pkgJson || !pkgJson.scripts) return;

    // Grouper les commandes par catégorie
    const groupedCommands = {};
    const processedCommands = new Set();

    for (const [command] of Object.entries(pkgJson.scripts)) {
        const { category } = getCommandCategory(command);
        
        // Vérifier si c'est une commande de groupe
        let isGroupCommand = false;
        for (const info of Object.values(commandCategories)) {
            if (info.groups && info.groups[command]) {
                isGroupCommand = true;
                break;
            }
        }

        if (isGroupCommand) {
            groupedCommands['Groupes'] = groupedCommands['Groupes'] || [];
            groupedCommands['Groupes'].push({ command, isGroupCommand: true });
            processedCommands.add(command);
        } else if (!processedCommands.has(command)) {
            groupedCommands[category] = groupedCommands[category] || [];
            groupedCommands[category].push({ command, isGroupCommand: false });
        }
    }

    // Afficher d'abord les groupes
    if (groupedCommands['Groupes']) {
        console.log(chalk.magenta('\n▼ Groupes'));
        groupedCommands['Groupes'].forEach(({ command, isGroupCommand }) => {
            console.log(formatCommand(command, isGroupCommand));
        });
    }

    // Afficher les autres catégories
    for (const [category, info] of Object.entries(commandCategories)) {
        if (category === 'Groupes') continue;
        const commands = groupedCommands[category] || [];
        if (commands.length === 0) continue;

        console.log(info.color('\n▼ ' + category));
        commands.forEach(({ command, isGroupCommand }) => {
            console.log(formatCommand(command, isGroupCommand));
        });
    }

    // Statistiques simples
    const stats = {
        total: Object.keys(pkgJson.scripts).length,
        groups: Object.values(commandCategories)
            .filter(cat => cat.groups)
            .reduce((acc, cat) => acc + Object.keys(cat.groups || {}).length, 0)
    };

    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.blue(`${stats.total} commandes, dont ${stats.groups} groupes`) + '\n');
}

// Exécuter l'affichage
displaySimpleCommandList().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 