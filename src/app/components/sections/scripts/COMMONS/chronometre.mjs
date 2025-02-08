import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeScript(scriptPath) {
    try {
        const fullPath = path.resolve(process.cwd(), scriptPath);
        const child = spawn('node', [fullPath], { stdio: 'inherit' });
        
        return new Promise((resolve, reject) => {
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Le script s'est terminé avec le code ${code}`));
                }
            });
            child.on('error', reject);
        });
    } catch (error) {
        console.error(chalk.red(`\n❌ Erreur lors de l'exécution du script: ${error.message}\n`));
        process.exit(1);
    }
}

async function startTimer(duration, message = null) {
    // Afficher une seule fois le message de démarrage
    console.log(`⏱️  Démarrage du minuteur: ${duration} secondes`);
    
    // Attendre la durée spécifiée
    await new Promise(resolve => {
        setTimeout(resolve, duration * 1000);
    });

    // Afficher le message de fin
    if (message) {
        console.log(`✨ ${message}`);
    } else {
        console.log('✅ Terminé !');
    }
}

// Récupérer les arguments
const seconds = parseInt(process.argv[2]);
const message = process.argv[3] || '';
const scriptPath = process.argv[4] || '';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node chronometre.mjs <secondes> [message] [script]\n'));
    console.log(chalk.gray('  Exemples:'));
    console.log(chalk.gray('    node chronometre.mjs 10'));
    console.log(chalk.gray('    node chronometre.mjs 5 "Lancer la sauvegarde"'));
    console.log(chalk.gray('    node chronometre.mjs 10 "Lancer la sauvegarde" backup.mjs\n'));
    process.exit(0);
}

startTimer(seconds, message, scriptPath); 