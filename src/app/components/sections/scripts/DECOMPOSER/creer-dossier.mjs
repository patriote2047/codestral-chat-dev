import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

/**
 * Crée un dossier pour le module décomposé
 * @param {string} moduleNom - Nom du module (sans extension)
 * @returns {Promise<string>} Chemin du dossier créé
 * @throws {Error} Si le dossier ne peut pas être créé
 */
export async function creerDossier(moduleNom) {
    try {
        // Nettoyer le nom du module
        const nomNettoye = moduleNom.replace(/[^a-zA-Z0-9-_]/g, '-');
        
        // Créer le chemin du dossier
        const dossierPath = path.join(process.cwd(), nomNettoye);

        // Vérifier si le dossier existe déjà
        if (fs.existsSync(dossierPath)) {
            // Ajouter un suffixe numérique si le dossier existe déjà
            let compteur = 1;
            let nouveauPath = dossierPath;
            while (fs.existsSync(nouveauPath)) {
                nouveauPath = `${dossierPath}-${compteur}`;
                compteur++;
            }
            await fs.promises.mkdir(nouveauPath);
            return nouveauPath;
        }

        // Créer le dossier
        await fs.promises.mkdir(dossierPath, { recursive: true });
        return dossierPath;
    } catch (error) {
        throw new Error(`Erreur lors de la création du dossier: ${error.message}`);
    }
}

// Si le script est exécuté directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const moduleNom = process.argv[2];

    if (!moduleNom) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node creer-dossier.mjs <nom_du_module>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Nettoyer le nom du module'));
        console.log(chalk.gray('    2. Créer un dossier avec ce nom'));
        console.log(chalk.gray('    3. Gérer les conflits de noms\n'));
        process.exit(0);
    }

    try {
        const dossierPath = await creerDossier(moduleNom);
        console.log(chalk.green(`✓ Dossier créé: ${dossierPath}`));
    } catch (error) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
} 