import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeTranspilationConfig } from './readers/transpilation-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration de Transpilation\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier de configuration de transpilation trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier de configuration (.swcrc ou babel.config.js)\n');
    output += chalk.gray('  • Configurer les cibles de compilation\n');
    output += chalk.gray('  • Définir les plugins nécessaires\n');
    output += chalk.gray('  • Configurer les optimisations\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE LA TRANSPILATION\n');
    output += chalk.gray('  • Support des fonctionnalités modernes\n');
    output += chalk.gray('  • Compatibilité navigateurs\n');
    output += chalk.gray('  • Optimisation du code\n');
    output += chalk.gray('  • Transformation TypeScript/JSX\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • Preset env pour Babel\n');
    output += chalk.gray('  • Configuration des modules\n');
    output += chalk.gray('  • Minification et optimisation\n');
    output += chalk.gray('  • Support TypeScript/JSX\n');
    output += chalk.gray('  • Source maps pour le débogage\n');

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

        // Vérifier l'extension et le type de fichier
        const ext = path.extname(filePath);
        const fileName = path.basename(filePath);
        let type = 'babel';

        if (fileName === '.swcrc' || fileName === 'swc.config.js') {
            type = 'swc';
        } else if (!['js', 'json'].includes(ext.slice(1))) {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Pour les fichiers .js, extraire la configuration
        let configContent;
        if (ext === '.js') {
            const match = content.match(/(module\.exports|export default)\s*=\s*({[\s\S]*})/);
            if (!match) {
                console.log(await generateDefaultReport());
                return;
            }
            configContent = match[2]
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ajouter des guillemets aux clés
                .replace(/'/g, '"') // Remplacer les apostrophes par des guillemets
                .replace(/,(\s*[}\]])/g, '$1'); // Supprimer les virgules trailing
        } else {
            configContent = content;
        }

        try {
            // Générer le rapport
            const report = await analyzeTranspilationConfig(configContent, type);
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
    console.log(chalk.white('  node read-transpilation.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - .swcrc'));
    console.log(chalk.gray('    - swc.config.js'));
    console.log(chalk.gray('    - babel.config.js'));
    console.log(chalk.gray('    - .babelrc'));
    console.log(chalk.gray('    - .babelrc.json\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Configuration du parser'));
    console.log(chalk.gray('    - Options de transformation'));
    console.log(chalk.gray('    - Optimisations'));
    console.log(chalk.gray('    - Configuration des modules'));
    console.log(chalk.gray('    - Cibles de compilation'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-transpilation.mjs ../.swcrc\n'));
    process.exit(0);
}

analyzeFile(filePath); 