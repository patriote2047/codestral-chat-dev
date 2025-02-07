import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process';
import { analyzeGitConfig } from './readers/git-reader.mjs';

async function generateDefaultReport() {
    let output = '';
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Git\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    output += chalk.yellow('\n[1] ÉTAT DE LA CONFIGURATION\n');
    output += chalk.gray('  • Aucune configuration Git trouvée\n');
    
    output += chalk.yellow('\n[2] RECOMMANDATIONS\n');
    output += chalk.gray('  • Initialiser un dépôt Git avec git init\n');
    output += chalk.gray('  • Configurer les informations utilisateur (user.name, user.email)\n');
    output += chalk.gray('  • Définir le dépôt distant avec git remote\n');
    output += chalk.gray('  • Configurer les hooks Git pour la qualité du code\n');
    
    output += chalk.yellow('\n[3] AVANTAGES DE GIT\n');
    output += chalk.gray('  • Gestion de versions\n');
    output += chalk.gray('  • Collaboration en équipe\n');
    output += chalk.gray('  • Traçabilité des modifications\n');
    output += chalk.gray('  • Branches pour les fonctionnalités\n');
    
    output += chalk.yellow('\n[4] FICHIERS DE CONFIGURATION\n');
    output += chalk.gray('  • .git/config - Configuration locale du dépôt\n');
    output += chalk.gray('  • .gitconfig - Configuration globale de l\'utilisateur\n');
    output += chalk.gray('  • .gitignore - Fichiers à ignorer\n');
    output += chalk.gray('  • .git/hooks/ - Scripts de hooks Git\n');

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
}

async function analyzeGitConfigs(localPath) {
    try {
        let hasConfig = false;
        let configs = [];

        // Vérifier si le répertoire .git et le fichier config existent
        const gitConfigPath = localPath || '.git/config';
        if (!fs.existsSync(gitConfigPath)) {
            console.log(await generateDefaultReport());
            return;
        }

        // Vérifier si le chemin est spécifié et existe
        if (!localPath) {
            // Essayer de lire la configuration globale
            try {
                const globalConfig = execSync('git config --list', { encoding: 'utf-8' });
                if (globalConfig) {
                    hasConfig = true;
                    const formattedConfig = formatGitConfigList(globalConfig);
                    configs.push({
                        type: 'global',
                        content: formattedConfig
                    });
                }
            } catch (error) {
                // Si aucune configuration n'est trouvée, afficher le rapport par défaut
                console.log(await generateDefaultReport());
                return;
            }
        } else {
            // Lire la configuration locale si elle existe
            const localContent = await fs.promises.readFile(localPath, 'utf-8');
            hasConfig = true;
            configs.push({
                type: 'local',
                content: localContent
            });

            // Essayer d'ajouter aussi la configuration globale
            try {
                const globalConfig = execSync('git config --list', { encoding: 'utf-8' });
                const formattedConfig = formatGitConfigList(globalConfig);
                configs.push({
                    type: 'global',
                    content: formattedConfig
                });
            } catch (error) {
                console.error(chalk.yellow('\n⚠️  Impossible de lire la configuration globale Git'));
            }
        }

        if (!hasConfig) {
            console.log(await generateDefaultReport());
            return;
        }

        // Analyser et afficher les rapports
        for (const config of configs) {
            console.log(chalk.blue(`\n📄 Configuration ${config.type.toUpperCase()}`));
            const report = await analyzeGitConfig(config.content);
            console.log(report);
        }

    } catch (error) {
        console.log(await generateDefaultReport());
    }
}

function formatGitConfigList(configList) {
    const sections = {};
    
    // Parser chaque ligne de configuration
    configList.split('\n').forEach(line => {
        if (!line) return;
        
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        
        if (key && value) {
            const parts = key.split('.');
            const section = parts[0];
            const subsection = parts.length > 2 ? parts[1] : null;
            const param = parts[parts.length - 1];
            
            if (!sections[section]) {
                sections[section] = {};
            }
            
            if (subsection) {
                if (!sections[section][subsection]) {
                    sections[section][subsection] = {};
                }
                sections[section][subsection][param] = value;
            } else {
                sections[section][param] = value;
            }
        }
    });
    
    // Convertir en format .gitconfig
    let output = '';
    for (const [section, content] of Object.entries(sections)) {
        if (typeof content === 'object') {
            for (const [key, value] of Object.entries(content)) {
                if (typeof value === 'object') {
                    output += `[${section} "${key}"]\n`;
                    for (const [subkey, subvalue] of Object.entries(value)) {
                        output += `\t${subkey} = ${subvalue}\n`;
                    }
                } else {
                    output += `[${section}]\n`;
                    output += `\t${key} = ${value}\n`;
                }
            }
        }
    }
    
    return output;
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2] || '.git/config';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.blue('\n📋 Utilisation:\n'));
    console.log(chalk.white('  node read-git.mjs [chemin_du_fichier]\n'));
    console.log(chalk.gray('  Fichiers supportés:'));
    console.log(chalk.gray('    - .git/config (par défaut)'));
    console.log(chalk.gray('    - .gitconfig\n'));
    console.log(chalk.gray('  Le rapport inclura:'));
    console.log(chalk.gray('    - Configuration locale ET globale'));
    console.log(chalk.gray('    - Paramètres principaux'));
    console.log(chalk.gray('    - Configuration des dépôts distants'));
    console.log(chalk.gray('    - Configuration des branches'));
    console.log(chalk.gray('    - Hooks Git'));
    console.log(chalk.gray('    - Configuration utilisateur'));
    console.log(chalk.gray('    - Alertes de sécurité\n'));
    console.log(chalk.gray('  Si aucun fichier n\'est trouvé:'));
    console.log(chalk.gray('    - État de la configuration'));
    console.log(chalk.gray('    - Recommandations'));
    console.log(chalk.gray('    - Avantages de Git'));
    console.log(chalk.gray('    - Fichiers de configuration\n'));
    console.log(chalk.gray('  Exemple:'));
    console.log(chalk.gray('    node read-git.mjs\n'));
    process.exit(0);
}

analyzeGitConfigs(filePath); 