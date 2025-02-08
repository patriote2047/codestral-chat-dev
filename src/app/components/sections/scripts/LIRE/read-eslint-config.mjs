import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeEslintConfig } from './readers/eslint-config.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration ESLint\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier de configuration ESLint trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier .eslintrc.js ou .eslintrc.json\n');
    output += chalk.gray('  • Définir les règles de style de code\n');
    output += chalk.gray('  • Configurer les plugins nécessaires\n');
    output += chalk.gray('  • Spécifier l\'environnement d\'exécution\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE ESLINT\n');
    output += chalk.gray('  • Détection des erreurs potentielles\n');
    output += chalk.gray('  • Cohérence du style de code\n');
    output += chalk.gray('  • Intégration avec l\'IDE\n');
    output += chalk.gray('  • Maintenance facilitée\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • Extends (configurations de base)\n');
    output += chalk.gray('  • Parser et options du parser\n');
    output += chalk.gray('  • Plugins essentiels\n');
    output += chalk.gray('  • Règles personnalisées\n');
    output += chalk.gray('  • Ignorer les fichiers non pertinents\n');

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
        if (!['.js', '.json'].includes(ext)) {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Pour les fichiers .js, on doit extraire l'objet de configuration
        let configContent;
        if (ext === '.js') {
            // Extraire l'objet entre module.exports = { ... }
            const match = content.match(/module\.exports\s*=\s*({[\s\S]*})/);
            if (!match) {
                console.log(await generateDefaultReport());
                return;
            }
            // Convertir la chaîne en objet JSON valide
            configContent = match[1]
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ajouter des guillemets aux clés
                .replace(/'/g, '"'); // Remplacer les apostrophes par des guillemets
        } else {
            configContent = content;
        }

        try {
            // Générer le rapport
            const report = await analyzeEslintConfig(configContent);
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

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-eslint-config.mjs [chemin_du_fichier]\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - .eslintrc.js'));
    console.log(chalk.gray('    - .eslintrc.json\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Configuration du parser'));
    console.log(chalk.gray('    - Règles de style'));
    console.log(chalk.gray('    - Plugins installés'));
    console.log(chalk.gray('    - Environnements configurés'));
    console.log(chalk.gray('    - Alertes et recommandations\n'));
    console.log(chalk.gray('  Si aucun fichier n\'est trouvé:'));
    console.log(chalk.gray('    - État de la configuration'));
    console.log(chalk.gray('    - Recommandations'));
    console.log(chalk.gray('    - Avantages d\'ESLint'));
    console.log(chalk.gray('    - Configuration recommandée\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-eslint-config.mjs ../.eslintrc.js\n'));
    process.exit(0);
}

analyzeFile(filePath); 