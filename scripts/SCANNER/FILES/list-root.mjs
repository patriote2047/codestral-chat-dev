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

async function getStats(itemPath) {
    try {
        const stats = await fs.promises.stat(itemPath);
        return {
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
        };
    } catch (error) {
        console.error(chalk.red(`Erreur lors de la lecture des stats de ${itemPath}:`), error);
        return null;
    }
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

async function listRootItems() {
    try {
        const items = await fs.promises.readdir(ROOT_DIR);
        const rootItems = [];

        for (const item of items) {
            // Ignorer les éléments exclus
            if (excludePatterns.includes(item)) {
                continue;
            }

            const fullPath = path.join(ROOT_DIR, item);
            const stats = await getStats(fullPath);
            
            if (stats) {
                rootItems.push({
                    name: item,
                    ...stats
                });
            }
        }

        return rootItems;
    } catch (error) {
        console.error(chalk.red('Erreur lors de la lecture du répertoire:'), error);
        return [];
    }
}

function padEnd(str, width) {
    const visibleLength = str.replace(/\u001b\[\d+m/g, '').length;
    const padding = Math.max(0, width - visibleLength);
    return str + ' '.repeat(padding);
}

async function displayRootItems() {
    console.log(chalk.blue('\n📂 Contenu de la racine du projet:\n'));

    const items = await listRootItems();
    
    if (items.length === 0) {
        console.log(chalk.yellow('  Aucun élément trouvé'));
        return;
    }

    // Trier les éléments : dossiers d'abord, puis fichiers
    items.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
    });

    // Afficher l'en-tête
    const headers = ['Type', 'Nom', 'Taille', 'Dernière modification'];
    console.log(chalk.gray('   ' + headers.join('   ') + '\n'));

    // Afficher les dossiers
    if (items.some(item => item.isDirectory)) {
        items.filter(item => item.isDirectory).forEach(item => {
            console.log(
                chalk.blue('📁  ') +
                padEnd(chalk.blue('DIR'), 6) +
                padEnd(chalk.blue(item.name), 30) +
                padEnd(chalk.blue('--'), 12) +
                chalk.gray(formatDate(item.modified))
            );
        });
    }

    // Afficher les fichiers
    if (items.some(item => !item.isDirectory)) {
        // Ajouter une ligne vide si on a affiché des dossiers avant
        if (items.some(item => item.isDirectory)) {
            console.log('');
        }

        items.filter(item => !item.isDirectory).forEach(item => {
            console.log(
                '📄  ' +
                padEnd('FILE', 6) +
                padEnd(item.name, 30) +
                padEnd(formatSize(item.size), 12) +
                chalk.gray(formatDate(item.modified))
            );
        });
    }

    // Afficher les statistiques
    const stats = {
        total: items.length,
        directories: items.filter(item => item.isDirectory).length,
        files: items.filter(item => !item.isDirectory).length,
        totalSize: items.reduce((sum, item) => sum + (item.isDirectory ? 0 : item.size), 0)
    };

    console.log(chalk.blue('\n📊 Résumé:\n'));
    console.log(chalk.gray('  Total:      ') + chalk.white(stats.total));
    console.log(chalk.gray('  Dossiers:   ') + chalk.blue(stats.directories));
    console.log(chalk.gray('  Fichiers:   ') + chalk.white(stats.files));
    console.log(chalk.gray('  Taille:     ') + chalk.green(formatSize(stats.totalSize)) + '\n');
}

// Exécuter l'affichage
displayRootItems().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 