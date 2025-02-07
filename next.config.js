/** @type {import('next').NextConfig} */
const nextConfig = {
    // Désactiver la compression pour améliorer les performances WebSocket
    compress: false,

    // Configuration du compilateur pour styled-components
    compiler: {
        styledComponents: true,
    },

    // Configuration expérimentale
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    // Configuration des en-têtes HTTP
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Authorization',
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                ],
            },
        ];
    },

    // Configuration des rewrites pour le WebSocket
    async rewrites() {
        return [
            {
                source: '/socket.io/:path*',
                destination: 'http://localhost:3001/socket.io/:path*',
            },
            {
                source: '/ws',
                destination: 'http://localhost:3001/socket.io',
            },
        ];
    },

    webpack: (config, { isServer }) => {
        // Ajouter le support pour les imports TypeScript depuis JavaScript
        config.resolve.extensions.push('.ts', '.tsx');

        return config;
    },

    // Mode strict de React
    reactStrictMode: true,
};

module.exports = nextConfig;
