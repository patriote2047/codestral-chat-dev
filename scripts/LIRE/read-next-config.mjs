import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeNextConfig } from './readers/next-config-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Next.js\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier next.config.js trouvé\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Créer un fichier next.config.js\n');
    output += chalk.gray('  • Configurer le mode strict de React\n');
    output += chalk.gray('  • Définir les optimisations de build\n');
    output += chalk.gray('  • Configurer les redirections et rewrites\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE NEXT.JS\n');
    output += chalk.gray('  • Rendu hybride (SSR/SSG)\n');
    output += chalk.gray('  • Optimisation automatique\n');
    output += chalk.gray('  • Routes API intégrées\n');
    output += chalk.gray('  • Support TypeScript natif\n');
    
    output += chalk.yellow('\n[4] CONFIGURATION RECOMMANDÉE\n');
    output += chalk.gray('  • reactStrictMode: true\n');
    output += chalk.gray('  • compiler: optimisations\n');
    output += chalk.gray('  • images: configuration du loader\n');
    output += chalk.gray('  • headers: sécurité\n');
    output += chalk.gray('  • webpack: personnalisation\n');

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
        if (ext !== '.js') {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Extraire la configuration
        let configContent;
        const constMatch = content.match(/const\s+\w+\s*=\s*({[\s\S]*?});(?:\s*module\.exports|\s*export\s+default)/);
        
        if (!constMatch) {
            console.log(await generateDefaultReport());
            return;
        }

        configContent = constMatch[1];

        try {
            // Créer un objet de configuration simplifié
            const config = {
                compress: configContent.includes('compress: false'),
                compiler: configContent.includes('compiler: {') ? {
                    styledComponents: configContent.includes('styledComponents: true'),
                } : null,
                experimental: configContent.includes('experimental: {') ? {
                    serverActions: configContent.includes('serverActions: {'),
                    bodySizeLimit: '10mb'
                } : null,
                headers: configContent.includes('headers()'),
                rewrites: configContent.includes('rewrites()'),
                webpack: configContent.includes('webpack:'),
                reactStrictMode: configContent.includes('reactStrictMode: true')
            };

            // Générer le rapport
            const report = await analyzeNextConfig(JSON.stringify(config));
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
    console.log(chalk.white('  node read-next-config.mjs <chemin_du_fichier>\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - next.config.js\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Configuration du compilateur'));
    console.log(chalk.gray('    - Fonctionnalités expérimentales'));
    console.log(chalk.gray('    - Configuration des en-têtes'));
    console.log(chalk.gray('    - Règles de réécriture'));
    console.log(chalk.gray('    - Performance'));
    console.log(chalk.gray('    - Sécurité\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-next-config.mjs ../next.config.js\n'));
    process.exit(0);
}

analyzeFile(filePath); 