export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testMatch: [
        '**/tests/**/*.test.mjs'
    ],
    type: 'module',
    experimental: {
        runtimeDetection: true
    }
}; 