import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeTsConfig } from './readers/tsconfig-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration TypeScript\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier tsconfig.json trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier tsconfig.json\n');
    output += chalk.gray('  • Configurer les options du compilateur\n');
    output += chalk.gray('  • Définir les chemins d\'inclusion/exclusion\n');
    output += chalk.gray('  • Spécifier les bibliothèques nécessaires\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE TYPESCRIPT\n');
    output += chalk.gray('  • Typage statique\n');
    output += chalk.gray('  • Détection d\'erreurs précoce\n');
    output += chalk.gray('  • Meilleure maintenabilité\n');
    output += chalk.gray('  • Support IDE amélioré\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • strict: true pour un typage strict\n');
    output += chalk.gray('  • target: version ECMAScript cible\n');
    output += chalk.gray('  • module: système de modules\n');
    output += chalk.gray('  • outDir: dossier de sortie\n');
    output += chalk.gray('  • rootDir: dossier source\n');

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
}

async function analyzeFile(filePath) {
    try {
        // Si aucun fichier n'est spécifié, générer un rapport par défaut
        if (!filePath) {
            console.log(await generateDefaultReport());
            return;
        }

        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
            console.log(await generateDefaultReport());
            return;
        }

        // Vérifier l'extension du fichier
        const ext = path.extname(filePath);
        if (ext !== '.json') {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        try {
            // Générer le rapport
            const report = await analyzeTsConfig(content);
            console.log(report);
        } catch (error) {
            console.log(await generateDefaultReport());
            return;
        }

    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur: ${error.message}\n`));
        process.exit(1);
    }
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2];

if (!filePath || process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-tsconfig.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - tsconfig.json'));
    console.log(chalk.gray('    - tsconfig.*.json (ex: tsconfig.build.json)\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-tsconfig.mjs ../tsconfig.json\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Configuration du compilateur'));
    console.log(chalk.gray('    - Gestion des fichiers'));
    console.log(chalk.gray('    - Alertes de sécurité'));
    console.log(chalk.gray('    - Optimisations'));
    console.log(chalk.gray('    - Configurations étendues\n'));
    process.exit(0);
}

analyzeFile(filePath); 