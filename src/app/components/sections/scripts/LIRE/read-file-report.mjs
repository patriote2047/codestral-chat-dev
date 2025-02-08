import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzePackageJson } from './readers/package-json.mjs';

async function analyzeFile(filePath) {
    try {
        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        
        // Sélectionner l'analyseur approprié selon le type de fichier
        let report = '';
        
        switch (fileName) {
            case 'package.json':
                report = await analyzePackageJson(content);
                break;
            default:
                throw new Error('Type de fichier non pris en charge');
        }

        // Afficher le rapport
        console.log(report);

    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur: ${error.message}\n`));
        process.exit(1);
    }
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2];

if (!filePath || process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-file-report.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - package.json: Analyse détaillée du package\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-file-report.mjs ../package.json\n'));
    process.exit(0);
}

analyzeFile(filePath); 