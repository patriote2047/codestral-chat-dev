import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeWebpackConfig } from './readers/webpack-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Webpack\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier de configuration Webpack trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier webpack.config.js pour la configuration\n');
    output += chalk.gray('  • Configurer les points d\'entrée et de sortie\n');
    output += chalk.gray('  • Définir les loaders nécessaires pour votre projet\n');
    output += chalk.gray('  • Configurer les plugins selon vos besoins\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE WEBPACK\n');
    output += chalk.gray('  • Bundling optimisé des ressources\n');
    output += chalk.gray('  • Gestion des dépendances\n');
    output += chalk.gray('  • Transformation des assets\n');
    output += chalk.gray('  • Hot Module Replacement (HMR)\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION MINIMALE RECOMMANDÉE\n');
    output += chalk.gray('  • Mode (development/production)\n');
    output += chalk.gray('  • Entry points\n');
    output += chalk.gray('  • Output configuration\n');
    output += chalk.gray('  • Loaders essentiels\n');
    output += chalk.gray('  • Plugins de base\n');

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
        
        if (!['js', 'mjs', 'cjs'].includes(ext.slice(1)) && !fileName.includes('webpack.config')) {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Extraire la configuration
        let configContent;
        const match = content.match(/(module\.exports|export default)\s*=\s*({[\s\S]*})/);
        
        if (!match) {
            console.log(await generateDefaultReport());
            return;
        }

        // Nettoyer la configuration
        configContent = cleanConfig(match[2]);

        try {
            // Convertir la configuration en objet
            const config = parseConfig(configContent);

            // Générer le rapport
            const report = await analyzeWebpackConfig(JSON.stringify(config));
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

function cleanConfig(config) {
    let cleaned = config;

    // Supprimer les commentaires
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    cleaned = cleaned.replace(/\/\/.*/g, '');

    // Remplacer les valeurs dynamiques par des chaînes vides
    cleaned = cleaned.replace(/require\([^)]+\)/g, '""');
    cleaned = cleaned.replace(/path\.resolve\([^)]+\)/g, '""');
    cleaned = cleaned.replace(/process\.env\.\w+/g, '""');
    cleaned = cleaned.replace(/webpack\.\w+/g, '""');

    // Remplacer les fonctions par des objets vides
    cleaned = cleaned.replace(/:\s*function\s*\([^)]*\)\s*{[^}]*}/g, ':{}');
    cleaned = cleaned.replace(/:\s*\([^)]*\)\s*=>\s*{[^}]*}/g, ':{}');
    cleaned = cleaned.replace(/:\s*\([^)]*\)\s*=>\s*[^,}\]]+/g, ':""');

    // Remplacer les instanciations de plugins
    cleaned = cleaned.replace(/new\s+\w+\([^)]*\)/g, '{}');

    // Nettoyer les objets vides
    cleaned = cleaned.replace(/\(\s*{\s*}\s*\)/g, '{}');

    // Supprimer les espaces inutiles
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

function parseConfig(configStr) {
    // Créer une fonction sécurisée pour évaluer la configuration
    const sandbox = {
        RegExp: RegExp,
        Object: Object,
        Array: Array,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Date: Date,
        Math: Math,
        console: {
            log: () => {},
            warn: () => {},
            error: () => {}
        }
    };

    const fn = new Function(...Object.keys(sandbox), `return ${configStr}`);
    return fn(...Object.values(sandbox));
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2];

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-webpack.mjs [chemin_du_fichier]\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - webpack.config.js'));
    console.log(chalk.gray('    - webpack.config.mjs'));
    console.log(chalk.gray('    - webpack.config.cjs\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Mode et environnement'));
    console.log(chalk.gray('    - Points d\'entrée'));
    console.log(chalk.gray('    - Configuration de sortie'));
    console.log(chalk.gray('    - Loaders'));
    console.log(chalk.gray('    - Plugins'));
    console.log(chalk.gray('    - Optimisation'));
    console.log(chalk.gray('    - Serveur de développement'));
    console.log(chalk.gray('    - Performance'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    console.log(chalk.gray('  Si aucun fichier n\'est trouvé:'));
    console.log(chalk.gray('    - État de la configuration'));
    console.log(chalk.gray('    - Recommandations'));
    console.log(chalk.gray('    - Avantages de Webpack'));
    console.log(chalk.gray('    - Configuration minimale recommandée\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-webpack.mjs ../webpack.config.js\n'));
    process.exit(0);
}

analyzeFile(filePath); 