import chalk from 'chalk';

// Configuration détaillée des commandes
const commandConfig = {
    'dev': {
        description: 'Serveur de développement',
        details: {
            'Port': '3000',
            'Mode': 'development',
            'Watch': 'activé'
        },
        usage: 'npm run dev',
        examples: [
            'npm run dev -- --port 8080',
            'npm run dev -- --mode production'
        ]
    },
    'build': {
        description: 'Build production',
        details: {
            'Mode': 'production',
            'Minification': 'activée',
            'Source maps': 'générées'
        },
        usage: 'npm run build',
        examples: [
            'npm run build -- --no-minify',
            'npm run build -- --analyze'
        ]
    },
    'test': {
        description: 'Tests avec couverture',
        details: {
            'Runner': 'Jest',
            'Coverage': 'activé',
            'Watch': 'désactivé'
        },
        usage: 'npm test',
        examples: [
            'npm test -- --watch',
            'npm test -- --coverage'
        ]
    }
};

function displayCommandDetails(command) {
    const config = commandConfig[command];
    if (!config) return;

    console.log(chalk.blue(`\n▼ ${command}`));
    console.log(chalk.gray('Description:'), config.description);
    
    console.log(chalk.gray('\nDétails:'));
    Object.entries(config.details).forEach(([key, value]) => {
        console.log(chalk.yellow(key.padEnd(15)), value);
    });
    
    console.log(chalk.gray('\nUtilisation:'));
    console.log(chalk.green(config.usage));
    
    console.log(chalk.gray('\nExemples:'));
    config.examples.forEach(example => {
        console.log(chalk.cyan('  ' + example));
    });
}

export function displayFullCommandList() {
    console.log(chalk.blue('\nListe détaillée des commandes'));
    console.log(chalk.gray('─'.repeat(50)));

    Object.keys(commandConfig).forEach(command => {
        displayCommandDetails(command);
        console.log(chalk.gray('\n' + '─'.repeat(50)));
    });
}

export default displayFullCommandList; 