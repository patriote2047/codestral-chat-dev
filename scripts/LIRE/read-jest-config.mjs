import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeJestConfig } from './readers/jest-config-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Jest\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier de configuration Jest trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier jest.config.js\n');
    output += chalk.gray('  • Configurer l\'environnement de test\n');
    output += chalk.gray('  • Définir les patterns de test\n');
    output += chalk.gray('  • Configurer la couverture de code\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE JEST\n');
    output += chalk.gray('  • Tests unitaires et d\'intégration\n');
    output += chalk.gray('  • Mocking intégré\n');
    output += chalk.gray('  • Snapshots testing\n');
    output += chalk.gray('  • Rapports de couverture\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • testEnvironment: node ou jsdom\n');
    output += chalk.gray('  • testMatch: patterns des fichiers de test\n');
    output += chalk.gray('  • collectCoverage: true pour la couverture\n');
    output += chalk.gray('  • setupFilesAfterEnv: configuration globale\n');
    output += chalk.gray('  • transform: configuration des transformations\n');

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
        if (!['.js', '.json', '.mjs'].includes(ext)) {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Pour les fichiers .js ou .mjs, extraire la configuration
        let configContent;
        if (ext === '.js' || ext === '.mjs') {
            // Vérifier si c'est une configuration Next.js
            if (content.includes('next/jest')) {
                const match = content.match(/const\s+customJestConfig\s*=\s*({[\s\S]*?});/);
                if (!match) {
                    console.log(await generateDefaultReport());
                    return;
                }
                configContent = match[1];
            } else {
                const match = content.match(/(module\.exports|export default)\s*=\s*({[\s\S]*})/);
                if (!match) {
                    console.log(await generateDefaultReport());
                    return;
                }
                configContent = match[2];
            }

            // Convertir la chaîne en objet JSON valide
            configContent = configContent
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ajouter des guillemets aux clés
                .replace(/'/g, '"') // Remplacer les apostrophes par des guillemets
                .replace(/,(\s*[}\]])/g, '$1') // Supprimer les virgules trailing
                .replace(/<rootDir>/g, '.') // Remplacer <rootDir> par .
                .replace(/\[\s*(['"].*?['"])\s*,\s*({[^}]*})\s*\]/g, '[$1]'); // Simplifier les transformations
        } else {
            configContent = content;
        }

        try {
            // Générer le rapport
            const report = await analyzeJestConfig(configContent);
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
    console.log(chalk.white('  node read-jest-config.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - jest.config.js'));
    console.log(chalk.gray('    - jest.config.mjs'));
    console.log(chalk.gray('    - jest.config.json\n'));
    console.log(chalk.gray('  Types de configuration:'));
    console.log(chalk.gray('    - Configuration Jest standard'));
    console.log(chalk.gray('    - Configuration Next.js Jest\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-jest-config.mjs ../jest.config.js\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Environnement de test'));
    console.log(chalk.gray('    - Patterns de test'));
    console.log(chalk.gray('    - Configuration des modules'));
    console.log(chalk.gray('    - Couverture de code'));
    console.log(chalk.gray('    - Performance'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    process.exit(0);
}

analyzeFile(filePath); 