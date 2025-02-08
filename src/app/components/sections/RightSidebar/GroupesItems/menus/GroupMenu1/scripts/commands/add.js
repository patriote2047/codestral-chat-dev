'use client';

export const commandManager = {
    commands: new Map(),

    add(command, description) {
        if (!command || typeof command !== 'string') {
            return {
                type: 'error',
                content: 'Le nom de la commande est requis et doit être une chaîne de caractères'
            };
        }

        if (!description || typeof description !== 'string') {
            return {
                type: 'error',
                content: 'La description est requise et doit être une chaîne de caractères'
            };
        }

        if (this.commands.has(command)) {
            return {
                type: 'error',
                content: `La commande "${command}" existe déjà`
            };
        }

        this.commands.set(command, {
            description,
            createdAt: new Date().toISOString()
        });

        return {
            type: 'success',
            title: 'Commande Ajoutée',
            subtitle: `La commande "${command}" a été ajoutée avec succès`,
            content: [
                { type: 'text', text: '\nDétails de la nouvelle commande:' },
                { type: 'separator' },
                {
                    type: 'command',
                    name: command,
                    description: description
                },
                { type: 'separator' },
                {
                    type: 'text',
                    text: `Total des commandes: ${this.commands.size}`
                }
            ],
            metadata: {
                timestamp: new Date().toISOString(),
                totalCommands: this.commands.size
            }
        };
    },

    remove(command) {
        if (!this.commands.has(command)) {
            return {
                type: 'error',
                content: `La commande "${command}" n'existe pas`
            };
        }

        this.commands.delete(command);
        return {
            type: 'success',
            content: `La commande "${command}" a été supprimée`
        };
    },

    get(command) {
        if (!this.commands.has(command)) {
            return {
                type: 'error',
                content: `La commande "${command}" n'existe pas`
            };
        }

        const commandData = this.commands.get(command);
        return {
            type: 'success',
            content: [
                { type: 'text', text: '\nDétails de la commande:' },
                { type: 'separator' },
                {
                    type: 'command',
                    name: command,
                    description: commandData.description
                },
                { type: 'text', text: `Créée le: ${commandData.createdAt}` }
            ]
        };
    },

    list() {
        if (this.commands.size === 0) {
            return {
                type: 'info',
                content: 'Aucune commande personnalisée n\'a été ajoutée'
            };
        }

        const content = [
            { type: 'text', text: '\nListe des commandes personnalisées:' },
            { type: 'separator' }
        ];

        for (const [command, data] of this.commands) {
            content.push({
                type: 'command',
                name: command,
                description: data.description
            });
        }

        content.push({ type: 'separator' });
        content.push({
            type: 'text',
            text: `Total: ${this.commands.size} commande(s)`
        });

        return {
            type: 'success',
            title: 'Commandes Personnalisées',
            subtitle: 'Liste des commandes ajoutées',
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                totalCommands: this.commands.size
            }
        };
    }
}; 