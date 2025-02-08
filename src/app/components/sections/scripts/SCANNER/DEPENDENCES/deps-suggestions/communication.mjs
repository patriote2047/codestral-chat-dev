// Suggestions de dépendances pour la communication
export const communicationDeps = {
    'nodemailer': {
        category: 'Communication',
        description: 'Solution d\'envoi d\'emails complète',
        useCases: [
            'Envoi d\'emails',
            'Templates HTML',
            'Pièces jointes',
            'SMTP personnalisé',
            'Files d\'attente'
        ],
        type: 'prod'
    },
    'mjml': {
        category: 'Communication',
        description: 'Framework pour emails responsifs',
        useCases: [
            'Templates email responsifs',
            'Composants réutilisables',
            'Compatibilité clients',
            'Preview en temps réel',
            'Integration build'
        ],
        type: 'prod'
    },
    'socket.io': {
        category: 'Communication',
        description: 'Communication bidirectionnelle en temps réel',
        useCases: [
            'Chat en temps réel',
            'Notifications push',
            'Mises à jour en direct',
            'Salles et espaces',
            'Reconnexion automatique'
        ],
        type: 'prod'
    },
    'socket.io-client': {
        category: 'Communication',
        description: 'Client Socket.IO pour le navigateur',
        useCases: [
            'Connexion WebSocket côté client',
            'Communication temps réel',
            'Reconnexion automatique',
            'Support des événements',
            'Compatibilité cross-browser'
        ],
        type: 'prod'
    },
    'ws': {
        category: 'Communication',
        description: 'Client/serveur WebSocket léger',
        useCases: [
            'WebSocket bas niveau',
            'Performance optimale',
            'Faible overhead',
            'Extensible',
            'Support binaire'
        ],
        type: 'prod'
    },
    'mqtt': {
        category: 'Communication',
        description: 'Client MQTT pour Node.js',
        useCases: [
            'IoT et M2M',
            'Pub/Sub léger',
            'QoS configurable',
            'Rétention messages',
            'Support SSL/TLS'
        ],
        type: 'prod'
    },
    'amqplib': {
        category: 'Communication',
        description: 'Client AMQP 0-9-1 pour RabbitMQ',
        useCases: [
            'Message queuing',
            'Pub/Sub avancé',
            'Routing messages',
            'Clustering',
            'Haute disponibilité'
        ],
        type: 'prod'
    }
}; 