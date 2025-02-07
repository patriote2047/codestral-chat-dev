module.exports = {
    // Lint & Prettier pour les fichiers JavaScript/TypeScript
    '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

    // Prettier pour les autres fichiers
    '**/*.{json,css,scss,md,html,yaml,yml}': ['prettier --write'],
};
