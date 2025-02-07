import fs from 'node:fs';
import chalk from 'chalk';

/**
 * Lit le contenu d'un fichier JavaScript
 * @param {string} filePath - Chemin du fichier à lire
 * @returns {Promise<string>} Contenu du fichier
 * @throws {Error} Si le fichier n'existe pas ou ne peut pas être lu
 */
export async function lireFichier(filePath) {
    console.log('Début de lireFichier, chemin:', filePath);
    try {
        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`Le fichier ${filePath} n'existe pas`);
        }

        // Vérifier l'extension du fichier
        if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
            throw new Error('Le fichier doit avoir une extension .js ou .mjs');
        }

        // Lire le contenu du fichier
        const contenu = await fs.promises.readFile(filePath, 'utf-8');
        
        // Vérifier si le fichier n'est pas vide
        if (!contenu.trim()) {
            throw new Error('Le fichier est vide');
        }

        return contenu;
    } catch (error) {
        throw new Error(`Erreur lors de la lecture du fichier: ${error.message}`);
    }
}

// Si le script est exécuté directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const filePath = process.argv[2];

    if (!filePath) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node lire-fichier.mjs <chemin_du_fichier>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Vérifier si le fichier existe'));
        console.log(chalk.gray('    2. Vérifier l\'extension du fichier'));
        console.log(chalk.gray('    3. Lire le contenu du fichier'));
        console.log(chalk.gray('    4. Vérifier si le fichier n\'est pas vide\n'));
        process.exit(0);
    }

    try {
        const contenu = await lireFichier(filePath);
        console.log(chalk.green('✓ Fichier lu avec succès'));
        console.log(chalk.gray('Contenu du fichier:'));
        console.log(contenu);
    } catch (error) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
} 