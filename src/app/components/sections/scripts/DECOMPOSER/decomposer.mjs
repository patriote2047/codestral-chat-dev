import chalk from 'chalk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Obtenir le chemin absolu du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importer les modules avec des chemins relatifs simples
import { lireFichier } from './lire-fichier.mjs';
import { extraireFonctions } from './extraire-fonctions.mjs';
import { creerDossier } from './creer-dossier.mjs';
import { creerFichiersFonctions } from './creer-fichiers-fonctions.mjs';
import { creerFichierPrincipal } from './creer-fichier-principal.mjs';

/**
 * Décompose un fichier JavaScript en modules individuels
 * @param {string} filePath - Chemin du fichier à décomposer
 */
async function decomposer(filePath) {
    try {
        console.log(chalk.blue('\n🔍 Décomposition du fichier...'));
        console.log(chalk.gray(`Fichier source: ${filePath}`));

        // 1. Lire le fichier source
        console.log(chalk.gray('\n1. Lecture du fichier source...'));
        const contenu = await lireFichier(filePath);
        if (!contenu) {
            throw new Error('Le contenu du fichier est vide');
        }
        console.log(chalk.green('✓ Fichier lu avec succès'));
        console.log(chalk.gray(`Taille: ${contenu.length} caractères`));

        // 2. Extraire les fonctions
        console.log(chalk.gray('\n2. Extraction des fonctions...'));
        const fonctions = extraireFonctions(contenu);
        if (!fonctions || fonctions.length === 0) {
            throw new Error('Aucune fonction trouvée dans le fichier');
        }
        console.log(chalk.green(`✓ ${fonctions.length} fonctions extraites`));
        fonctions.forEach((f, i) => {
            console.log(chalk.gray(`   ${i + 1}. ${f.nom}`));
        });

        // 3. Créer le dossier pour le module
        console.log(chalk.gray('\n3. Création du dossier...'));
        const moduleNom = path.basename(filePath, path.extname(filePath));
        const dossierPath = await creerDossier(moduleNom);
        if (!dossierPath) {
            throw new Error('Échec de la création du dossier');
        }
        console.log(chalk.green(`✓ Dossier créé: ${dossierPath}`));

        // 4. Créer les fichiers des fonctions
        console.log(chalk.gray('\n4. Création des fichiers des fonctions...'));
        await creerFichiersFonctions(dossierPath, fonctions);
        console.log(chalk.green('✓ Fichiers des fonctions créés'));

        // 5. Créer le fichier principal dans le dossier
        console.log(chalk.gray('\n5. Création du fichier principal dans le dossier...'));
        const fichierPrincipalPath = await creerFichierPrincipal(moduleNom, dossierPath, fonctions);
        if (!fichierPrincipalPath) {
            throw new Error('Échec de la création du fichier principal');
        }
        console.log(chalk.green(`✓ Fichier principal créé: ${fichierPrincipalPath}`));

        // 6. Créer le fichier principal à la racine
        console.log(chalk.gray('\n6. Création du fichier principal à la racine...'));
        const contenuPrincipal = `/**
 * Module de gestion des calculs mathématiques avancés
 * Ce module contient une série de fonctions pour effectuer des calculs
 * mathématiques et géométriques.
 * 
 * Ce fichier est le point d'entrée principal qui réexporte toutes les fonctions
 * depuis le module décomposé.
 */

export * from './${moduleNom}/index.mjs';`;
        
        const fichierRacinePath = path.join(path.dirname(dossierPath), `${moduleNom}.mjs`);
        await fs.promises.writeFile(fichierRacinePath, contenuPrincipal);
        console.log(chalk.green(`✓ Fichier principal à la racine créé: ${fichierRacinePath}`));

        console.log(chalk.blue('\n📦 Décomposition terminée avec succès!\n'));
        console.log(chalk.gray('Structure créée:'));
        console.log(chalk.gray(`  ${moduleNom}.mjs`));
        console.log(chalk.gray(`  ${moduleNom}/`));
        fonctions.forEach(f => {
            console.log(chalk.gray(`    ├── ${f.nom}.mjs`));
        });
        console.log();

    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur: ${error.message}`));
        if (error.stack) {
            console.error(chalk.gray('\nDétails de l\'erreur:'));
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
}

// Si le script est exécuté directement
const scriptPath = fileURLToPath(import.meta.url);
console.log('Debug - scriptPath:', scriptPath);
console.log('Debug - process.argv[1]:', process.argv[1]);

if (process.argv[1].endsWith('decomposer.mjs')) {
    const filePath = process.argv[2];

    if (!filePath || process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node decomposer.mjs <chemin_du_fichier>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Lire le fichier JavaScript source'));
        console.log(chalk.gray('    2. Extraire toutes les fonctions'));
        console.log(chalk.gray('    3. Créer un dossier pour le module'));
        console.log(chalk.gray('    4. Créer un fichier par fonction'));
        console.log(chalk.gray('    5. Créer un fichier principal qui importe/exporte tout\n'));
        console.log(chalk.gray('  Chaque étape est réalisée par un script séparé:'));
        console.log(chalk.gray('    - scripts/lire-fichier.mjs'));
        console.log(chalk.gray('    - scripts/extraire-fonctions.mjs'));
        console.log(chalk.gray('    - scripts/creer-dossier.mjs'));
        console.log(chalk.gray('    - scripts/creer-fichiers-fonctions.mjs'));
        console.log(chalk.gray('    - scripts/creer-fichier-principal.mjs\n'));
        console.log(chalk.gray('  Exemple:'));
        console.log(chalk.gray('    node decomposer.mjs ../mon-module.js\n'));
        process.exit(0);
    }

    try {
        console.log(chalk.blue('\nDémarrage de la décomposition...'));
        console.log(chalk.gray(`Fichier source: ${filePath}`));
        console.log(chalk.gray('Chemin absolu:', path.resolve(filePath)));
        
        await decomposer(filePath).catch(error => {
            console.error(chalk.red(`\n❌ Erreur dans decomposer: ${error.message}`));
            console.error(chalk.gray('\nDétails de l\'erreur:'));
            console.error(chalk.gray(error.stack));
            process.exit(1);
        });
        
        console.log(chalk.green('\n✓ Décomposition terminée avec succès!'));
    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur principale: ${error.message}`));
        console.error(chalk.gray('\nDétails de l\'erreur:'));
        console.error(chalk.gray(error.stack));
        process.exit(1);
    }
} 