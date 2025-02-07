import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Configuration
const excludePatterns = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage'
];

async function isDirectory(path) {
    try {
        return (await fs.promises.stat(path)).isDirectory();
    } catch (error) {
        return false;
    }
}

async function listDirectories(dir, level = 0) {
    try {
        const items = await fs.promises.readdir(dir);
        const directories = [];

        for (const item of items) {
            // Ignorer les dossiers exclus
            if (excludePatterns.includes(item)) {
                continue;
            }

            const fullPath = path.join(dir, item);
            if (await isDirectory(fullPath)) {
                // Ajouter ce dossier
                directories.push({
                    path: path.relative(ROOT_DIR, fullPath),
                    level
                });

                // Récursivement ajouter les sous-dossiers
                const subDirs = await listDirectories(fullPath, level + 1);
                directories.push(...subDirs);
            }
        }

        return directories;
    } catch (error) {
        console.error(chalk.red(`Erreur lors de la lecture de ${dir}:`), error);
        return [];
    }
}

async function displayDirectoryTree() {
    console.log(chalk.blue('\n📂 Structure des dossiers du projet:\n'));

    const directories = await listDirectories(ROOT_DIR);
    
    // Trier les dossiers par chemin
    directories.sort((a, b) => a.path.localeCompare(b.path));

    // Afficher la structure
    directories.forEach(({ path: dirPath, level }) => {
        const indent = '  '.repeat(level);
        const icon = level === 0 ? '📁' : '└─';
        console.log(chalk.gray(`${indent}${icon} `) + chalk.white(dirPath));
    });

    console.log(chalk.blue(`\n📊 Total: ${directories.length} dossiers\n`));
}

// Exécuter l'affichage
displayDirectoryTree().catch(error => {
    console.error(chalk.red('Erreur fatale:'), error);
    process.exit(1);
}); 