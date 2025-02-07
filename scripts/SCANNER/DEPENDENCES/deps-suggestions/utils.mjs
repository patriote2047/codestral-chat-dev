// Suggestions de dépendances pour les utilitaires
export const utilsDeps = {
    'uuid': {
        category: 'Utils',
        description: 'Générateur d\'identifiants uniques',
        useCases: [
            'IDs uniques',
            'Random UUIDs',
            'Namespace UUIDs',
            'Version 4 UUIDs',
            'UUID validation'
        ],
        type: 'prod'
    },
    'bufferutil': {
        category: 'Utils',
        description: 'Optimisation WebSocket',
        useCases: [
            'WebSocket performance',
            'Buffer operations',
            'Memory optimization',
            'Native bindings',
            'Socket.IO support'
        ],
        type: 'prod'
    },
    'utf-8-validate': {
        category: 'Utils',
        description: 'Validation UTF-8',
        useCases: [
            'UTF-8 validation',
            'WebSocket messages',
            'Stream validation',
            'Performance',
            'Binary data'
        ],
        type: 'prod'
    }
}; 