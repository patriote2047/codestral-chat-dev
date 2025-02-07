import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeDockerfile, analyzeDockerCompose } from './readers/docker-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Docker\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucun fichier Docker trouvé dans le projet\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Considérer l\'ajout d\'un Dockerfile pour la conteneurisation\n');
    output += chalk.gray('  • Considérer l\'ajout d\'un docker-compose.yml pour l\'orchestration\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE LA CONTENEURISATION\n');
    output += chalk.gray('  • Isolation des dépendances\n');
    output += chalk.gray('  • Portabilité entre environnements\n');
    output += chalk.gray('  • Facilité de déploiement\n');
    output += chalk.gray('  • Gestion simplifiée des versions\n');
    
    output += chalk.yellow('\n[4] FICHIERS RECOMMANDÉS\n');
    output += chalk.gray('  • Dockerfile - Pour la construction de l\'image\n');
    output += chalk.gray('  • .dockerignore - Pour exclure les fichiers non nécessaires\n');
    output += chalk.gray('  • docker-compose.yml - Pour la gestion multi-conteneurs\n');

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
        
        // Déterminer le type de fichier Docker
        let isDockerfile = fileName === 'Dockerfile' || fileName.startsWith('Dockerfile.');
        let isCompose = fileName.includes('docker-compose') || (ext === '.yml' && fileName.includes('docker'));
        
        if (!isDockerfile && !isCompose) {
            console.log(await generateDefaultReport());
            return;
        }

        // Lire le contenu du fichier
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // Générer le rapport approprié
        const report = isDockerfile ? 
            await analyzeDockerfile(content) : 
            await analyzeDockerCompose(content);
            
        console.log(report);

    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur: ${error.message}\n`));
        process.exit(1);
    }
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2];

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-docker.mjs [chemin_du_fichier]\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - Dockerfile'));
    console.log(chalk.gray('    - Dockerfile.*'));
    console.log(chalk.gray('    - docker-compose.yml'));
    console.log(chalk.gray('    - docker-compose.*.yml\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    Pour Dockerfile:'));
    console.log(chalk.gray('    - Image de base'));
    console.log(chalk.gray('    - Stages de build'));
    console.log(chalk.gray('    - Commandes'));
    console.log(chalk.gray('    - Volumes'));
    console.log(chalk.gray('    - Ports exposés'));
    console.log(chalk.gray('    - Variables d\'environnement'));
    console.log(chalk.gray('    - Bonnes pratiques'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    console.log(chalk.gray('    Pour docker-compose:'));
    console.log(chalk.gray('    - Services'));
    console.log(chalk.gray('    - Réseaux'));
    console.log(chalk.gray('    - Volumes'));
    console.log(chalk.gray('    - Dépendances'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    console.log(chalk.gray('  Si aucun fichier n\'est trouvé:'));
    console.log(chalk.gray('    - État de la configuration'));
    console.log(chalk.gray('    - Recommandations'));
    console.log(chalk.gray('    - Avantages de la conteneurisation'));
    console.log(chalk.gray('    - Fichiers recommandés\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-docker.mjs ../Dockerfile\n'));
    process.exit(0);
}

analyzeFile(filePath); 