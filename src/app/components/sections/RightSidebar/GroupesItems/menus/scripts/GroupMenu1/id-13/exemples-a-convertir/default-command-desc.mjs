import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Descriptions par défaut des commandes courantes
export const defaultCommandDescriptions = {
    // Commandes de développement
    'dev': 'Démarre le serveur de développement',
    'dev:watch': 'Démarre le serveur avec rechargement automatique',
    'dev:debug': 'Démarre le serveur en mode debug',
    'dev:managed': 'Démarre le serveur avec gestion avancée des processus',

    // Commandes de build
    'build': 'Compile le projet pour la production',
    'build:dev': 'Compile le projet pour le développement',
    'build:staging': 'Compile le projet pour l\'environnement de staging',
    'build:analyze': 'Compile et analyse la taille du bundle',
    'start': 'Démarre le serveur de production',

    // Commandes de test
    'test': 'Lance tous les tests',
    'test:watch': 'Lance les tests en mode watch',
    'test:coverage': 'Lance les tests avec rapport de couverture',
    'test:e2e': 'Lance les tests end-to-end',
    'test:unit': 'Lance les tests unitaires',
    'test:integration': 'Lance les tests d\'intégration',
    'test:ci': 'Lance les tests pour l\'intégration continue',
    'test:staged': 'Lance les tests sur les fichiers modifiés',
    'test:update': 'Met à jour les snapshots des tests',
    'test:debug': 'Lance les tests en mode debug',

    // Commandes de lint et format
    'lint': 'Vérifie le style du code',
    'lint:fix': 'Vérifie et corrige le style du code',
    'format': 'Formate le code selon les règles définies',
    'format:check': 'Vérifie le formatage du code',
    'type-check': 'Vérifie les types TypeScript',

    // Commandes d\'analyse
    'analyze': 'Analyse le code et génère des rapports',
    'analyze:deps': 'Analyse les dépendances du projet',
    'analyze:bundle': 'Analyse la taille du bundle',
    'analyze:coverage': 'Analyse la couverture de code',

    // Commandes de documentation
    'docs': 'Génère la documentation',
    'docs:dev': 'Démarre le serveur de documentation',
    'docs:build': 'Compile la documentation',
    'docs:deploy': 'Déploie la documentation',

    // Commandes de gestion des dépendances
    'deps:check': 'Vérifie les mises à jour disponibles',
    'deps:update': 'Met à jour les dépendances',
    'deps:clean': 'Nettoie les dépendances inutilisées',
    'deps:audit': 'Vérifie les vulnérabilités',
    'deps:install': 'Installe les dépendances',
    'deps:outdated': 'Liste les dépendances obsolètes',

    // Commandes de nettoyage
    'clean': 'Nettoie les fichiers de build',
    'clean:all': 'Nettoie tous les fichiers générés',
    'clean:cache': 'Nettoie les fichiers de cache',
    'clean:modules': 'Supprime node_modules',

    // Commandes de déploiement
    'deploy': 'Déploie l\'application',
    'deploy:staging': 'Déploie sur l\'environnement de staging',
    'deploy:prod': 'Déploie sur l\'environnement de production',
    'deploy:docs': 'Déploie la documentation',

    // Commandes de gestion de version
    'version': 'Met à jour la version',
    'version:major': 'Met à jour la version majeure',
    'version:minor': 'Met à jour la version mineure',
    'version:patch': 'Met à jour la version patch',

    // Commandes d\'analyse de code
    'list:dirs': 'Liste les répertoires du projet',
    'list:files': 'Liste tous les fichiers du projet',
    'list:functions': 'Liste les fonctions d\'un fichier',
    'list:lines': 'Compte les lignes d\'un fichier',
    'list:root': 'Liste les fichiers à la racine',
    'list:config': 'Liste les fichiers de configuration',
    'list:deps': 'Liste les dépendances du projet',
    'list:commands': 'Liste détaillée des commandes',
    'list:commands:simple': 'Liste simplifiée des commandes',

    // Commandes de validation
    'validate': 'Valide le code (types, lint, format)',
    'validate:deps': 'Valide les dépendances',
    'validate:types': 'Valide les types TypeScript',
    'validate:format': 'Valide le formatage',

    // Commandes de préparation
    'prepare': 'Prépare le projet après installation',
    'postinstall': 'Actions post-installation',
    'precommit': 'Actions avant commit',
    'prepush': 'Actions avant push'
};

// Fonction pour obtenir une description par défaut
export function getDefaultDescription(command) {
    return defaultCommandDescriptions[command] || null;
}

// Fonction pour obtenir toutes les descriptions par pattern
export function getDescriptionsByPattern(pattern) {
    const regex = new RegExp(pattern);
    return Object.entries(defaultCommandDescriptions)
        .filter(([command]) => regex.test(command))
        .reduce((acc, [command, description]) => {
            acc[command] = description;
            return acc;
        }, {});
}

// Fonction pour afficher les descriptions disponibles
export function displayAvailableDescriptions() {
    console.log(chalk.blue('\nDescriptions de commandes disponibles par défaut\n'));

    // Grouper par préfixe
    const groups = Object.entries(defaultCommandDescriptions)
        .reduce((acc, [command, description]) => {
            const prefix = command.split(':')[0];
            acc[prefix] = acc[prefix] || [];
            acc[prefix].push({ command, description });
            return acc;
        }, {});

    // Afficher par groupe
    Object.entries(groups).sort().forEach(([prefix, commands]) => {
        console.log(chalk.yellow(`\n${prefix}`));
        commands.forEach(({ command, description }) => {
            console.log(chalk.gray('  ├─ ') + chalk.green(command.padEnd(20)) + chalk.white(description));
        });
    });

    console.log(chalk.blue(`\nTotal: ${Object.keys(defaultCommandDescriptions).length} descriptions\n`));
}

// Catégories de commandes avec leurs patterns
const commandCategories = {
    'Développement': {
        pattern: /^dev/,
        keywords: ['dev', 'watch', 'debug', 'managed', 'serve']
    },
    'Build': {
        pattern: /^(build|start)/,
        keywords: ['build', 'compile', 'start', 'run', 'serve']
    },
    'Tests': {
        pattern: /^test/,
        keywords: ['test', 'spec', 'check', 'coverage', 'jest', 'mocha']
    },
    'Linting & Format': {
        pattern: /^(lint|format|validate)/,
        keywords: ['lint', 'format', 'style', 'prettier', 'eslint']
    },
    'Analyse': {
        pattern: /^(list|check|analyze)/,
        keywords: ['list', 'check', 'analyze', 'scan', 'report']
    },
    'Dépendances': {
        pattern: /^(deps|update|reinstall)/,
        keywords: ['deps', 'dependencies', 'install', 'update', 'clean']
    },
    'Nettoyage': {
        pattern: /^clean/,
        keywords: ['clean', 'clear', 'remove', 'delete', 'purge']
    }
};

// Fonction pour lire le package.json
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

// Fonction pour déterminer la catégorie d'une commande
function detectCommandCategory(command) {
    for (const [category, info] of Object.entries(commandCategories)) {
        if (info.pattern.test(command)) {
            return { category, keywords: info.keywords };
        }
    }
    return { category: 'Autres', keywords: [] };
}

// Fonction pour calculer la similarité entre deux chaînes
function calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.toLowerCase().split(/[:\-_]/));
    const set2 = new Set(str2.toLowerCase().split(/[:\-_]/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// Fonction pour trouver la description la plus proche
function findSimilarDescription(command, category) {
    let bestMatch = null;
    let bestScore = 0;

    // Filtrer les descriptions par catégorie
    const categoryDescriptions = Object.entries(defaultCommandDescriptions)
        .filter(([cmd]) => {
            const cmdCategory = detectCommandCategory(cmd).category;
            return cmdCategory === category;
        });

    for (const [existingCmd, description] of categoryDescriptions) {
        const score = calculateSimilarity(command, existingCmd);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = { command: existingCmd, description, score };
        }
    }

    return bestMatch;
}

// Importer les descriptions existantes
async function getExistingDescriptions() {
    try {
        const commandsFile = path.join(__dirname, 'list-commands.mjs');
        const content = await fs.promises.readFile(commandsFile, 'utf-8');
        
        // Extraire le bloc de descriptions
        const match = content.match(/const commandDescriptions = ({[\s\S]*?});/);
        if (!match) {
            return {};
        }
        
        // Évaluer le contenu pour obtenir l'objet
        const descriptionsBlock = match[1];
        return eval('(' + descriptionsBlock + ')');
    } catch (error) {
        console.error(chalk.red('Erreur lors de la lecture des descriptions existantes:'), error);
        return {};
    }
}

// Fonction pour analyser et suggérer des descriptions
async function analyzeMissingDescriptions() {
    console.log(chalk.blue('\nAnalyse des commandes sans description\n'));

    const pkgJson = await readPackageJson();
    if (!pkgJson || !pkgJson.scripts) return;

    // Fusionner les descriptions existantes avec les descriptions par défaut
    const existingDescriptions = await getExistingDescriptions();
    const allDescriptions = { ...defaultCommandDescriptions, ...existingDescriptions };

    const commands = Object.keys(pkgJson.scripts);
    const missingDescriptions = commands.filter(cmd => !allDescriptions[cmd]);

    if (missingDescriptions.length === 0) {
        console.log(chalk.green('✓ Toutes les commandes ont une description !'));
        return;
    }

    console.log(chalk.yellow(`${missingDescriptions.length} commandes sans description :\n`));

    // Grouper par catégorie
    const groupedMissing = missingDescriptions.reduce((acc, cmd) => {
        const { category } = detectCommandCategory(cmd);
        acc[category] = acc[category] || [];
        acc[category].push(cmd);
        return acc;
    }, {});

    for (const [category, commands] of Object.entries(groupedMissing)) {
        console.log(chalk.yellow(`\n${category}:`));

        for (const cmd of commands) {
            const similar = findSimilarDescription(cmd, category);
            console.log(chalk.gray('\n  Command: ') + chalk.green(cmd));
            
            if (similar && similar.score > 0.3) {
                console.log(chalk.gray('  Similaire à: ') + chalk.blue(similar.command));
                console.log(chalk.gray('  Suggestion: ') + chalk.white(similar.description));
                console.log(chalk.gray('  Score: ') + chalk.cyan(`${(similar.score * 100).toFixed(1)}%`));
            } else {
                console.log(chalk.gray('  Aucune suggestion pertinente trouvée'));
            }
        }
    }

    console.log(chalk.blue('\nPour ajouter ces descriptions, utilisez:'));
    console.log(chalk.gray('npm run add:command:desc\n'));
}

// Si exécuté directement, analyser les descriptions manquantes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--show-all')) {
        displayAvailableDescriptions();
    } else {
        analyzeMissingDescriptions();
    }
} 