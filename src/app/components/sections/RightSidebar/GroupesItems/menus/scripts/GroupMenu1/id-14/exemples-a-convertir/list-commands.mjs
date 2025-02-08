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
        description: 'Commandes pour le développement',
        color: chalk.blue
    },
    'Tests': {
        pattern: /^test/,
        description: 'Commandes pour les tests',
        color: chalk.magenta
    },
    'Linting & Format': {
        pattern: /^(lint|format|validate)/,
        description: 'Commandes pour la qualité du code',
        color: chalk.yellow
    },
    'Build': {
        pattern: /^(build|start)/,
        description: 'Commandes de build et démarrage',
        color: chalk.green
    },
    'Analyse': {
        pattern: /^(list|check):/,
        description: 'Commandes d\'analyse du code',
        color: chalk.cyan
    },
    'Dépendances': {
        pattern: /^(deps|update|reinstall)/,
        description: 'Gestion des dépendances',
        color: chalk.red
    },
    'Nettoyage': {
        pattern: /^clean/,
        description: 'Commandes de nettoyage',
        color: chalk.gray
    }
};

// Descriptions détaillées des commandes
const commandDescriptions = {
    'dev': 'Démarre le serveur de développement',
    'dev:watch': 'Démarre le serveur avec rechargement automatique',
    'dev:managed': 'Démarre le serveur avec gestion avancée des processus',
    'build': 'Compile le projet pour la production',
    'start': 'Démarre le serveur de production',
    'lint': 'Vérifie et corrige le style du code',
    'format': 'Formate le code selon les règles définies',
    'type-check': 'Vérifie les types TypeScript',
    'test': 'Lance tous les tests avec couverture',
    'test:staged': 'Lance les tests sur les fichiers modifiés',
    'test:check-missing': 'Vérifie les fichiers sans tests',
    'test:move': 'Déplace les tests dans le bon dossier',
    'test:full': 'Lance tous les tests et vérifie les manquants',
    'list:dirs': 'Liste les répertoires du projet',
    'list:files': 'Liste tous les fichiers du projet',
    'list:functions': 'Liste les fonctions d\'un fichier',
    'list:lines': 'Compte les lignes d\'un fichier',
    'list:root': 'Liste les fichiers à la racine',
    'list:config': 'Liste les fichiers de configuration',
    'list:deps': 'Liste les dépendances du projet',
    'check:deps': 'Analyse l\'utilisation des dépendances',
    'validate': 'Vérifie le code (types, lint, format)',
    'clean': 'Nettoie les fichiers de build',
    'clean:all': 'Nettoie tout (build + node_modules)',
    'reinstall': 'Réinstalle toutes les dépendances',
    'deps:check': 'Vérifie les mises à jour disponibles',
    'deps:update': 'Met à jour les dépendances',
    'deps:audit': 'Vérifie les vulnérabilités',
    'update': 'Met à jour toutes les dépendances',
    'prepare': 'Configure les hooks git'
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
        description: 'Autres commandes',
        color: chalk.white
    };
}

function formatCommand(command, script, isGroupCommand = false) {
    const description = commandDescriptions[command] || 'Pas de description';
    const commandStr = command.padEnd(20);
    let output = '      ' + chalk.green(commandStr) + ' │ ' + chalk.gray(description) + 
           '\n      ' + chalk.gray(''.padEnd(20) + ' │ ' + script);

    // Si c'est une commande de groupe, ajouter les sous-commandes
    if (isGroupCommand) {
        for (const [category, info] of Object.entries(commandCategories)) {
            if (info.groups && info.groups[command]) {
                output += '\n      ' + chalk.gray(''.padEnd(20) + ' │ ');
                output += chalk.yellow('\n      ' + chalk.gray(''.padEnd(20) + ' │ ') + '⚡ Commandes incluses:');
                info.groups[command].commands.forEach(subCommand => {
                    output += '\n      ' + chalk.gray(''.padEnd(20) + ' │ ') + chalk.blue(`  • ${subCommand}`);
                });
            }
        }
    }

    return output;
}

async function displayCommands() {
    console.log(chalk.blue('\nCommandes disponibles'));
    console.log(chalk.gray('='.repeat(80)));

    const pkgJson = await readPackageJson();
    if (!pkgJson || !pkgJson.scripts) return;

    // Grouper les commandes par catégorie
    const groupedCommands = {};
    const processedCommands = new Set();

    for (const [command, script] of Object.entries(pkgJson.scripts)) {
        const { category } = getCommandCategory(command);
        
        // Vérifier si c'est une commande de groupe
        let isGroupCommand = false;
        for (const info of Object.values(commandCategories)) {
            if (info.groups && info.groups[command]) {
                isGroupCommand = true;
                break;
            }
        }

        // Si c'est une commande de groupe, la mettre dans la catégorie Groupes
        if (isGroupCommand) {
            groupedCommands['Groupes'] = groupedCommands['Groupes'] || [];
            groupedCommands['Groupes'].push({ command, script, isGroupCommand: true });
            processedCommands.add(command);
        } else if (!processedCommands.has(command)) {
            groupedCommands[category] = groupedCommands[category] || [];
            groupedCommands[category].push({ command, script, isGroupCommand: false });
        }
    }

    // Statistiques
    const stats = {
        total: Object.keys(pkgJson.scripts).length,
        categories: Object.keys(groupedCommands).length,
        groups: Object.values(commandCategories)
            .filter(cat => cat.groups)
            .reduce((acc, cat) => acc + Object.keys(cat.groups || {}).length, 0)
    };

    // Afficher d'abord les groupes
    if (groupedCommands['Groupes']) {
        console.log(chalk.magenta('\nGroupes'));
        console.log(chalk.gray('Groupes de commandes composées'));
        console.log(chalk.gray('    ┌' + '─'.repeat(78)));
        
        groupedCommands['Groupes'].forEach(({ command, script, isGroupCommand }) => {
            console.log(formatCommand(command, script, isGroupCommand));
            console.log(chalk.gray('    ├' + '─'.repeat(78)));
        });
    }

    // Afficher les autres catégories
    for (const [category, info] of Object.entries(commandCategories)) {
        if (category === 'Groupes') continue;
        const commands = groupedCommands[category] || [];
        if (commands.length === 0) continue;

        console.log(info.color('\n' + category));
        console.log(chalk.gray(info.description));
        console.log(chalk.gray('    ┌' + '─'.repeat(78)));
        
        commands.forEach(({ command, script, isGroupCommand }) => {
            console.log(formatCommand(command, script, isGroupCommand));
            console.log(chalk.gray('    ├' + '─'.repeat(78)));
        });
    }

    // Afficher les statistiques
    console.log(chalk.gray('\n' + '='.repeat(80)));
    console.log(chalk.blue('Statistiques'));
    console.log(chalk.gray('  Total des commandes:  ') + chalk.white(stats.total));
    console.log(chalk.gray('  Catégories:          ') + chalk.white(stats.categories));
    console.log(chalk.gray('  Groupes:             ') + chalk.magenta(stats.groups) + '\n');
}

// Exécuter l'affichage
displayCommands().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 