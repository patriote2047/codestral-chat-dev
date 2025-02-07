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

// Extensions courantes et leurs catégories
const fileCategories = {
    'JavaScript': ['.js', '.jsx', '.mjs'],
    'TypeScript': ['.ts', '.tsx'],
    'Styles': ['.css', '.scss', '.sass', '.less'],
    'Configuration': ['.json', '.yaml', '.yml', '.env', '.config.js'],
    'Documentation': ['.md', '.mdx', '.txt'],
    'Tests': ['.test.js', '.test.ts', '.spec.js', '.spec.ts']
};

async function isDirectory(path) {
    try {
        return (await fs.promises.stat(path)).isDirectory();
    } catch (error) {
        return false;
    }
}

function getFileCategory(filename) {
    const ext = path.extname(filename).toLowerCase();
    const fullname = path.basename(filename).toLowerCase();

    // Vérifier d'abord les patterns de test
    if (fullname.includes('.test.') || fullname.includes('.spec.')) {
        return 'Tests';
    }

    // Puis vérifier les extensions
    for (const [category, extensions] of Object.entries(fileCategories)) {
        if (extensions.some(e => filename.toLowerCase().endsWith(e))) {
            return category;
        }
    }

    return 'Autres';
}

async function listFiles(dir, level = 0) {
    try {
        const items = await fs.promises.readdir(dir);
        const files = [];

        for (const item of items) {
            // Ignorer les dossiers exclus
            if (excludePatterns.some(pattern => dir.includes(pattern))) {
                continue;
            }

            const fullPath = path.join(dir, item);
            if (await isDirectory(fullPath)) {
                // Récursivement ajouter les fichiers des sous-dossiers
                const subFiles = await listFiles(fullPath, level + 1);
                files.push(...subFiles);
            } else {
                // Ajouter ce fichier
                files.push({
                    path: path.relative(ROOT_DIR, fullPath),
                    level,
                    category: getFileCategory(item),
                    size: (await fs.promises.stat(fullPath)).size
                });
            }
        }

        return files;
    } catch (error) {
        console.error(chalk.red(`Erreur lors de la lecture de ${dir}:`), error);
        return [];
    }
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

async function displayFileTree() {
    console.log(chalk.blue('\n📄 Liste des fichiers du projet:\n'));

    const files = await listFiles(ROOT_DIR);
    
    // Trier les fichiers par catégorie puis par chemin
    files.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.path.localeCompare(b.path);
    });

    // Statistiques par catégorie
    const stats = {};
    let totalSize = 0;

    // Afficher les fichiers par catégorie
    let currentCategory = '';
    files.forEach(({ path: filePath, level, category, size }) => {
        // Mettre à jour les statistiques
        stats[category] = (stats[category] || 0) + 1;
        totalSize += size;

        // Afficher l'en-tête de catégorie si elle change
        if (category !== currentCategory) {
            console.log(chalk.yellow(`\n${category}:`));
            currentCategory = category;
        }

        const indent = '  '.repeat(1);
        const fileSize = formatFileSize(size);
        console.log(chalk.gray(`${indent}└─ `) + chalk.white(filePath) + chalk.gray(` (${fileSize})`));
    });

    // Afficher les statistiques
    console.log(chalk.blue('\n📊 Résumé:'));
    console.log(chalk.gray('  Nombre total de fichiers: ') + chalk.white(files.length));
    console.log(chalk.gray('  Taille totale: ') + chalk.white(formatFileSize(totalSize)));
    console.log(chalk.gray('\n  Par catégorie:'));
    Object.entries(stats).forEach(([category, count]) => {
        console.log(chalk.gray(`    ${category}: `) + chalk.white(count));
    });
    console.log();
}

// Exécuter l'affichage
displayFileTree().catch(error => {
    console.error(chalk.red('Erreur fatale:'), error);
    process.exit(1);
}); 