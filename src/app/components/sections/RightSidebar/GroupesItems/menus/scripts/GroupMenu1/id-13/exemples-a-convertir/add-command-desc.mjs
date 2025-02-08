import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Chemins des fichiers
const COMMANDS_FILE = path.join(__dirname, 'list-commands-simple.mjs');
const COMMANDS_DETAILED_FILE = path.join(__dirname, 'list-commands.mjs');

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

async function readCommandsFile(filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        // Extraire le bloc de descriptions
        const match = content.match(/const commandDescriptions = {[\s\S]*?};/);
        if (!match) {
            throw new Error('Bloc de descriptions non trouvé');
        }
        return {
            content,
            descriptionsBlock: match[0],
            fullMatch: match[0]
        };
    } catch (error) {
        console.error(chalk.red(`Erreur lors de la lecture de ${filePath}:`), error);
        return null;
    }
}

function parseDescriptions(descriptionsBlock) {
    try {
        // Extraire le contenu entre les accolades
        const content = descriptionsBlock.match(/{[\s\S]*}/)[0];
        // Évaluer le contenu pour obtenir l'objet
        return eval('(' + content + ')');
    } catch (error) {
        console.error(chalk.red('Erreur lors du parsing des descriptions:'), error);
        return {};
    }
}

function formatDescriptionsBlock(descriptions) {
    const lines = Object.entries(descriptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `    '${key}': '${value}'`);
    
    return 'const commandDescriptions = {\n' + lines.join(',\n') + '\n};';
}

async function promptForDescription(command) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(chalk.blue('\nCommande: ') + chalk.green(command));
        rl.question(chalk.yellow('Description (laissez vide pour passer): '), (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function updateCommandDescriptions() {
    console.log(chalk.blue('\n📝 Mise à jour des descriptions des commandes\n'));

    // Lire package.json
    const pkgJson = await readPackageJson();
    if (!pkgJson || !pkgJson.scripts) return;

    // Lire les fichiers de commandes
    const simpleFile = await readCommandsFile(COMMANDS_FILE);
    const detailedFile = await readCommandsFile(COMMANDS_DETAILED_FILE);
    if (!simpleFile || !detailedFile) return;

    // Parser les descriptions existantes
    const currentDescriptions = parseDescriptions(simpleFile.descriptionsBlock);
    
    // Trouver les commandes sans description
    const commands = Object.keys(pkgJson.scripts);
    const missingCommands = commands.filter(cmd => !currentDescriptions[cmd]);

    if (missingCommands.length === 0) {
        console.log(chalk.green('✓ Toutes les commandes ont une description !'));
        return;
    }

    console.log(chalk.yellow(`ℹ ${missingCommands.length} commande(s) sans description :\n`));

    // Demander les descriptions manquantes
    const newDescriptions = { ...currentDescriptions };
    for (const cmd of missingCommands) {
        const desc = await promptForDescription(cmd);
        if (desc) {
            newDescriptions[cmd] = desc;
        }
    }

    // Mettre à jour les fichiers si des descriptions ont été ajoutées
    if (Object.keys(newDescriptions).length > Object.keys(currentDescriptions).length) {
        // Mettre à jour le fichier simple
        const newSimpleContent = simpleFile.content.replace(
            simpleFile.fullMatch,
            formatDescriptionsBlock(newDescriptions)
        );
        await fs.promises.writeFile(COMMANDS_FILE, newSimpleContent, 'utf-8');

        // Mettre à jour le fichier détaillé
        const newDetailedContent = detailedFile.content.replace(
            detailedFile.fullMatch,
            formatDescriptionsBlock(newDescriptions)
        );
        await fs.promises.writeFile(COMMANDS_DETAILED_FILE, newDetailedContent, 'utf-8');

        console.log(chalk.green('\n✓ Descriptions mises à jour avec succès !'));
    } else {
        console.log(chalk.yellow('\nℹ Aucune nouvelle description ajoutée.'));
    }
}

// Exécuter la mise à jour
updateCommandDescriptions().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 