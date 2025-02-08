import chalk from 'chalk';

// Structure pour stocker les descriptions de commandes
let commandDescriptions = {};

function validateCommandName(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Le nom de la commande est requis');
    }
    if (!/^[a-z][a-z0-9:-]*$/.test(name)) {
        throw new Error('Le nom de la commande doit commencer par une lettre et ne contenir que des lettres, chiffres, tirets et deux-points');
    }
}

function validateDescription(desc) {
    if (!desc || typeof desc !== 'string') {
        throw new Error('La description est requise');
    }
    if (desc.length < 10) {
        throw new Error('La description doit faire au moins 10 caractères');
    }
}

export function addCommandDescription(name, description) {
    try {
        validateCommandName(name);
        validateDescription(description);

        commandDescriptions[name] = {
            description,
            added: new Date().toISOString()
        };

        console.log(chalk.green('\n✓ Description ajoutée avec succès'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.blue('Commande:'), name);
        console.log(chalk.blue('Description:'), description);
        console.log(chalk.gray('─'.repeat(50)));

        return true;
    } catch (error) {
        console.error(chalk.red('\n✗ Erreur:'), error.message);
        return false;
    }
}

// Fonction pour afficher toutes les descriptions
export function listCommandDescriptions() {
    console.log(chalk.blue('\nDescriptions des commandes'));
    console.log(chalk.gray('─'.repeat(50)));

    if (Object.keys(commandDescriptions).length === 0) {
        console.log(chalk.yellow('Aucune description enregistrée'));
        return;
    }

    Object.entries(commandDescriptions).forEach(([name, info]) => {
        console.log(chalk.yellow(name));
        console.log(chalk.white(info.description));
        console.log(chalk.gray('Ajoutée le:'), new Date(info.added).toLocaleString());
        console.log(chalk.gray('─'.repeat(50)));
    });
}

export default {
    add: addCommandDescription,
    list: listCommandDescriptions
}; 