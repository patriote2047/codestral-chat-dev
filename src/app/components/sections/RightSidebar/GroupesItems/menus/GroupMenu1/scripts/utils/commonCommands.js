// Version: 2024-02-08-1
export const commonCommands = {
    // Commandes de développement
    'dev': {
        description: 'Lance le serveur de développement',
        category: 'Développement'
    },

    // Commandes de test
    'test': {
        description: 'Lance les tests',
        category: 'Test'
    },
    'test:watch': {
        description: 'Lance les tests en mode watch',
        category: 'Test'
    },
    'test:coverage': {
        description: 'Lance les tests avec rapport de couverture',
        category: 'Test'
    },

    // Commandes de build et production
    'build': {
        description: 'Compile le projet pour la production',
        category: 'Production'
    },
    'start': {
        description: 'Démarre l\'application en production',
        category: 'Production'
    },

    // Commandes de qualité de code
    'lint': {
        description: 'Vérifie le style du code',
        category: 'Qualité'
    },
    'lint:fix': {
        description: 'Corrige automatiquement le style du code',
        category: 'Qualité'
    },
    'format': {
        description: 'Formate le code source',
        category: 'Qualité'
    },

    // Commandes utilitaires
    'clean': {
        description: 'Nettoie les fichiers de build',
        category: 'Utilitaire'
    },
    'serve': {
        description: 'Sert l\'application en local',
        category: 'Développement'
    },
    'deploy': {
        description: 'Déploie l\'application',
        category: 'Production'
    },
    'watch': {
        description: 'Surveille les changements',
        category: 'Développement'
    }
}; 