import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzePrettierConfig } from './readers/prettier-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Prettier\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier de configuration Prettier trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier .prettierrc ou .prettierrc.json\n');
    output += chalk.gray('  • Définir les règles de formatage\n');
    output += chalk.gray('  • Configurer l\'indentation et les espaces\n');
    output += chalk.gray('  • Spécifier la gestion des guillemets\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE PRETTIER\n');
    output += chalk.gray('  • Formatage automatique du code\n');
    output += chalk.gray('  • Style cohérent dans tout le projet\n');
    output += chalk.gray('  • Intégration avec l\'IDE\n');
    output += chalk.gray('  • Gain de temps en revue de code\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • Taille des tabulations\n');
    output += chalk.gray('  • Longueur maximale des lignes\n');
    output += chalk.gray('  • Style des guillemets\n');
    output += chalk.gray('  • Virgules finales\n');
    output += chalk.gray('  • Configuration JSX/HTML\n');

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
        
        // Vérifier si c'est un fichier de configuration Prettier valide
        const validNames = [
            '.prettierrc',
            '.prettierrc.json',
            '.prettierrc.js',
            'prettier.config.js'
        ];
        
        if (!validNames.includes(fileName) && !['js', 'json'].includes(ext.slice(1))) {
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
            const report = await analyzePrettierConfig(configContent);
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
    console.log(chalk.white('  node read-prettier.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - .prettierrc'));
    console.log(chalk.gray('    - .prettierrc.json'));
    console.log(chalk.gray('    - .prettierrc.js'));
    console.log(chalk.gray('    - prettier.config.js\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Règles de formatage'));
    console.log(chalk.gray('    - Configuration de l\'indentation'));
    console.log(chalk.gray('    - Gestion des guillemets'));
    console.log(chalk.gray('    - Configuration JSX'));
    console.log(chalk.gray('    - Compatibilité'));
    console.log(chalk.gray('    - Alertes et risques\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-prettier.mjs ../.prettierrc\n'));
    process.exit(0);
}

analyzeFile(filePath); 