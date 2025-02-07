import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { lireFichier } from './lire-fichier.mjs';
import { extraireFonctions } from './extraire-fonctions.mjs';

/**
 * Crée le fichier principal qui importe et exporte toutes les fonctions
 * @param {string} moduleNom - Nom du module
 * @param {string} dossierPath - Chemin du dossier contenant les fonctions
 * @param {Array<Object>} fonctions - Liste des fonctions
 * @returns {Promise<string>} Chemin du fichier créé
 */
export async function creerFichierPrincipal(moduleNom, dossierPath, fonctions) {
    try {
        // Séparer les fonctions utilitaires de la logique
        const fonctionsUtilitaires = fonctions.filter(f => !f.estLogique);
        const fonctionsLogique = fonctions.filter(f => f.estLogique);

        // Créer le contenu du fichier index.mjs
        let contenu = '/**\n';
        contenu += ' * Module décomposé - Fichier principal\n';
        contenu += ' * Ce fichier contient la logique principale qui utilise les fonctions utilitaires.\n';
        contenu += ' */\n\n';

        // Importer toutes les fonctions utilitaires
        fonctionsUtilitaires.sort((a, b) => a.nom.localeCompare(b.nom)).forEach(f => {
            contenu += `import { ${f.nom} } from './${f.nom}.mjs';\n`;
        });
        contenu += '\n';

        // Ajouter les fonctions de logique directement dans le fichier
        fonctionsLogique.forEach(f => {
            contenu += `${f.contenu}\n\n`;
        });

        // Exporter toutes les fonctions
        contenu += 'export {\n';
        // D'abord les fonctions de logique
        fonctionsLogique.forEach(f => {
            contenu += `    ${f.nom},\n`;
        });
        // Puis les fonctions utilitaires
        fonctionsUtilitaires.forEach((f, i) => {
            contenu += `    ${f.nom}${i < fonctionsUtilitaires.length - 1 ? ',' : ''}\n`;
        });
        contenu += '};\n';

        // Créer le fichier dans le dossier du module
        const fichierPath = path.join(dossierPath, 'index.mjs');
        await fs.promises.writeFile(fichierPath, contenu);

        return fichierPath;
    } catch (error) {
        throw new Error(`Erreur lors de la création du fichier principal: ${error.message}`);
    }
}

// Si le script est exécuté directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const [, , filePath, dossierPath] = process.argv;

    if (!filePath || !dossierPath) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node creer-fichier-principal.mjs <fichier_source> <dossier_destination>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Lire le fichier source'));
        console.log(chalk.gray('    2. Extraire les fonctions'));
        console.log(chalk.gray('    3. Créer le fichier principal'));
        console.log(chalk.gray('    4. Importer et exporter toutes les fonctions\n'));
        process.exit(0);
    }

    try {
        const contenu = await lireFichier(filePath);
        const fonctions = extraireFonctions(contenu);
        const moduleNom = path.basename(dossierPath);
        const fichierPath = await creerFichierPrincipal(moduleNom, dossierPath, fonctions);
        console.log(chalk.green(`✓ Fichier principal créé: ${fichierPath}`));
    } catch (error) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
} 