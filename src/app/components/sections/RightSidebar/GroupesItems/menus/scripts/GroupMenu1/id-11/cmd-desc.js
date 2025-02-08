import chalk from 'chalk';

// Base de données des descriptions de commandes
const commandDescriptions = {
    'dev': {
        short: 'Serveur de développement',
        long: `Lance le serveur de développement avec hot-reload.
        - Surveille les changements de fichiers
        - Recharge automatiquement le navigateur
        - Affiche les erreurs en temps réel`,
        args: [
            { name: '--port', desc: 'Port du serveur (défaut: 3000)' },
            { name: '--host', desc: 'Hôte du serveur (défaut: localhost)' }
        ]
    },
    'build': {
        short: 'Build production',
        long: `Compile le projet pour la production.
        - Minifie le code
        - Optimise les assets
        - Génère les source maps`,
        args: [
            { name: '--analyze', desc: 'Analyse la taille du bundle' },
            { name: '--no-minify', desc: 'Désactive la minification' }
        ]
    },
    'test': {
        short: 'Tests avec couverture',
        long: `Lance la suite de tests avec rapport de couverture.
        - Exécute tous les tests
        - Génère un rapport de couverture
        - Vérifie les seuils minimaux`,
        args: [
            { name: '--watch', desc: 'Mode watch pour les tests' },
            { name: '--coverage', desc: 'Génère le rapport de couverture' }
        ]
    }
};

function displayDescription(command) {
    const desc = commandDescriptions[command];
    if (!desc) {
        console.log(chalk.red(`\nCommande '${command}' non trouvée`));
        return;
    }

    console.log(chalk.blue(`\n▼ ${command}`));
    console.log(chalk.gray('Description courte:'), desc.short);
    
    console.log(chalk.gray('\nDescription détaillée:'));
    console.log(chalk.white(desc.long));
    
    if (desc.args && desc.args.length > 0) {
        console.log(chalk.gray('\nArguments:'));
        desc.args.forEach(arg => {
            console.log(chalk.yellow(arg.name.padEnd(15)), arg.desc);
        });
    }
}

export function displayCommandDescriptions() {
    console.log(chalk.blue('\nDescriptions des commandes'));
    console.log(chalk.gray('─'.repeat(50)));

    Object.keys(commandDescriptions).forEach(command => {
        displayDescription(command);
        console.log(chalk.gray('\n' + '─'.repeat(50)));
    });
}

export default displayCommandDescriptions; 