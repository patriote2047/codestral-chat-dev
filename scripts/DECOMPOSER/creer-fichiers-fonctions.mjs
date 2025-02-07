import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { lireFichier } from './lire-fichier.mjs';
import { extraireFonctions } from './extraire-fonctions.mjs';

/**
 * Crée un fichier pour une fonction utilitaire
 * @param {string} dossierPath - Chemin du dossier
 * @param {Object} fonction - Informations sur la fonction
 * @param {string} fonction.nom - Nom de la fonction
 * @param {string} fonction.contenu - Code source de la fonction
 * @param {string[]} fonction.dependances - Dépendances de la fonction
 * @returns {Promise<void>}
 */
async function creerFichierFonction(dossierPath, fonction) {
    const fichierPath = path.join(dossierPath, `${fonction.nom}.mjs`);
    
    // Créer le contenu du fichier
    let contenu = '';
    
    // Ajouter les imports pour les dépendances
    if (fonction.dependances.length > 0) {
        fonction.dependances.forEach(dep => {
            contenu += `import { ${dep} } from './${dep}.mjs';\n`;
        });
        contenu += '\n';
    }

    // Ajouter le code de la fonction
    contenu += `${fonction.contenu}\n\n`;
    
    // Ajouter l'export
    contenu += `export { ${fonction.nom} };\n`;

    try {
        await fs.promises.writeFile(fichierPath, contenu);
    } catch (error) {
        throw new Error(`Erreur lors de la création du fichier ${fonction.nom}.mjs: ${error.message}`);
    }
}

/**
 * Crée les fichiers pour toutes les fonctions utilitaires
 * @param {string} dossierPath - Chemin du dossier
 * @param {Array<Object>} fonctions - Liste des fonctions
 * @returns {Promise<void>}
 */
export async function creerFichiersFonctions(dossierPath, fonctions) {
    try {
        // Vérifier si le dossier existe
        if (!fs.existsSync(dossierPath)) {
            throw new Error(`Le dossier ${dossierPath} n'existe pas`);
        }

        // Filtrer pour ne garder que les fonctions utilitaires
        const fonctionsUtilitaires = fonctions.filter(f => !f.estLogique);
        console.log(chalk.gray('\nFonctions utilitaires à créer:'));
        fonctionsUtilitaires.forEach(f => {
            console.log(chalk.gray(`  - ${f.nom}`));
        });

        // Créer un fichier pour chaque fonction utilitaire
        for (const fonction of fonctionsUtilitaires) {
            await creerFichierFonction(dossierPath, fonction);
            console.log(chalk.green(`✓ Fichier créé: ${fonction.nom}.mjs`));
        }

        // Afficher le nombre de fichiers créés
        console.log(chalk.blue(`\n📦 ${fonctionsUtilitaires.length} fichiers utilitaires créés`));
    } catch (error) {
        throw new Error(`Erreur lors de la création des fichiers: ${error.message}`);
    }
}

// Si le script est exécuté directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const [, , filePath, dossierPath] = process.argv;

    if (!filePath || !dossierPath) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node creer-fichiers-fonctions.mjs <fichier_source> <dossier_destination>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Lire le fichier source'));
        console.log(chalk.gray('    2. Extraire les fonctions'));
        console.log(chalk.gray('    3. Créer un fichier par fonction utilitaire'));
        console.log(chalk.gray('    4. Gérer les dépendances entre fonctions\n'));
        process.exit(0);
    }

    try {
        const contenu = await lireFichier(filePath);
        const fonctions = extraireFonctions(contenu);
        await creerFichiersFonctions(dossierPath, fonctions);
    } catch (error) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
} 