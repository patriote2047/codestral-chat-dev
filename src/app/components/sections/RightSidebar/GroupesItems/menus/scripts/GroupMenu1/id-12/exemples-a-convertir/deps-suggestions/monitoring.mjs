// Suggestions de dépendances pour le monitoring et les analytics
export const monitoringDeps = {
    'prometheus-client': {
        category: 'Monitoring',
        description: 'Client Prometheus officiel',
        useCases: [
            'Métriques système',
            'Custom metrics',
            'Histogrammes',
            'Compteurs',
            'Labels'
        ],
        type: 'prod'
    },
    'prom-client': {
        category: 'Monitoring',
        description: 'Client Prometheus pour Node.js',
        useCases: [
            'Métriques Node.js',
            'Métriques GC',
            'Métriques HTTP',
            'Agrégation',
            'Exportation'
        ],
        type: 'prod'
    },
    'winston': {
        category: 'Monitoring',
        description: 'Logger universel',
        useCases: [
            'Logging multi-transport',
            'Niveaux personnalisés',
            'Formatage',
            'Rotation fichiers',
            'Streaming'
        ],
        type: 'prod'
    },
    'pino': {
        category: 'Monitoring',
        description: 'Logger ultra-rapide',
        useCases: [
            'Logging haute performance',
            'Structured logging',
            'Child loggers',
            'Rotation',
            'Transport async'
        ],
        type: 'prod'
    },
    'newrelic': {
        category: 'Monitoring',
        description: 'Monitoring d\'application',
        useCases: [
            'APM',
            'Traces distribuées',
            'Métriques custom',
            'Alerting',
            'Dashboard'
        ],
        type: 'prod'
    },
    'elastic-apm-node': {
        category: 'Monitoring',
        description: 'APM Elastic pour Node.js',
        useCases: [
            'Performance monitoring',
            'Error tracking',
            'Distributed tracing',
            'Context propagation',
            'Stack traces'
        ],
        type: 'prod'
    },
    'dd-trace': {
        category: 'Monitoring',
        description: 'Traçage Datadog pour Node.js',
        useCases: [
            'Distributed tracing',
            'APM',
            'Service mapping',
            'Performance metrics',
            'Error tracking'
        ],
        type: 'prod'
    }
}; 