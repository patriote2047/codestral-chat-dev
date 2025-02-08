import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Configuration des types de fichiers de config
const configPatterns = {
    // JavaScript/TypeScript
    'package.json': 'NPM/Node.js',
    'package-lock.json': 'NPM/Node.js',
    'tsconfig.json': 'TypeScript',
    'jsconfig.json': 'JavaScript',
    '.babelrc': 'Babel',
    '.babelrc.js': 'Babel',
    'babel.config.js': 'Babel',
    '.eslintrc': 'ESLint',
    '.eslintrc.js': 'ESLint',
    '.eslintrc.json': 'ESLint',
    '.prettierrc': 'Prettier',
    '.prettierrc.js': 'Prettier',
    'prettier.config.js': 'Prettier',
    'next.config.js': 'Next.js',
    'next.config.mjs': 'Next.js',
    'jest.config.js': 'Jest',
    'jest.setup.js': 'Jest',
    '.swcrc': 'SWC',

    // Environnement
    '.env': 'Environment',
    '.env.local': 'Environment',
    '.env.development': 'Environment',
    '.env.production': 'Environment',
    '.env.test': 'Environment',

    // Git
    '.gitignore': 'Git',
    '.gitattributes': 'Git',
    '.gitmodules': 'Git',

    // Éditeurs
    '.editorconfig': 'Editor',
    '.vscode': 'VSCode',
    '.idea': 'IntelliJ',

    // Autres outils
    '.husky': 'Husky',
    '.lintstagedrc': 'Lint-staged',
    '.lintstagedrc.js': 'Lint-staged',
    'commitlint.config.js': 'CommitLint',
    'postcss.config.js': 'PostCSS',
    'tailwind.config.js': 'Tailwind',
    'webpack.config.js': 'Webpack',
    'rollup.config.js': 'Rollup',
    'vite.config.js': 'Vite',
    'nodemon.json': 'Nodemon',
    'vercel.json': 'Vercel',
    'netlify.toml': 'Netlify',
    'docker-compose.yml': 'Docker',
    'Dockerfile': 'Docker'
};

// Catégories principales
const configCategories = {
    'Tests': [
        'jest.config.js',
        'jest.setup.js',
        'vitest.config.js',
        'cypress.config.js',
        'karma.conf.js'
    ],
    'Correction du code': [
        '.eslintrc',
        '.eslintrc.js',
        '.eslintrc.json',
        '.prettierrc',
        '.prettierrc.js',
        'prettier.config.js',
        '.editorconfig',
        '.stylelintrc'
    ],
    'Dépendances': [
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'composer.json',
        'requirements.txt',
        'Gemfile',
        'go.mod'
    ],
    'Build & Compilation': [
        'tsconfig.json',
        'jsconfig.json',
        '.babelrc',
        '.babelrc.js',
        'babel.config.js',
        'webpack.config.js',
        'rollup.config.js',
        'vite.config.js',
        '.swcrc',
        'next.config.js',
        'next.config.mjs'
    ],
    'Environnement': [
        '.env',
        '.env.local',
        '.env.development',
        '.env.production',
        '.env.test',
        '.nvmrc',
        '.node-version'
    ],
    'Versioning': [
        '.gitignore',
        '.gitattributes',
        '.gitmodules'
    ],
    'CI/CD': [
        '.github',
        '.gitlab-ci.yml',
        '.travis.yml',
        'jenkins.yml',
        'azure-pipelines.yml',
        'vercel.json',
        'netlify.toml'
    ],
    'Hooks & Qualité': [
        '.husky',
        '.lintstagedrc',
        '.lintstagedrc.js',
        'commitlint.config.js',
        '.commitlintrc'
    ],
    'Docker': [
        'Dockerfile',
        'docker-compose.yml',
        '.dockerignore'
    ]
};

function getConfigCategory(filename) {
    for (const [category, patterns] of Object.entries(configCategories)) {
        if (patterns.some(pattern => {
            // Vérifier le nom exact ou si le fichier commence par le pattern
            return filename === pattern || 
                   filename.startsWith(pattern.replace('*', '')) ||
                   (pattern.startsWith('.') && filename.includes(pattern.slice(1)));
        })) {
            return category;
        }
    }
    return 'Autres';
}

async function getStats(itemPath) {
    try {
        const stats = await fs.promises.stat(itemPath);
        return {
            size: stats.size,
            modified: stats.mtime
        };
    } catch (error) {
        console.error(chalk.red(`Erreur lors de la lecture des stats de ${itemPath}:`), error);
        return null;
    }
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function padEnd(str, width) {
    const visibleLength = str.replace(/\u001b\[\d+m/g, '').length;
    const padding = Math.max(0, width - visibleLength);
    return str + ' '.repeat(padding);
}

async function listConfigFiles() {
    try {
        const items = await fs.promises.readdir(ROOT_DIR);
        const configFiles = [];

        for (const item of items) {
            // Vérifier si c'est un fichier de config
            if (configPatterns[item] || Object.keys(configPatterns).some(pattern => 
                item.startsWith('.') && item.includes(pattern.replace('.', '')))) {
                
                const fullPath = path.join(ROOT_DIR, item);
                const stats = await getStats(fullPath);
                
                if (stats) {
                    configFiles.push({
                        name: item,
                        type: configPatterns[item] || 'Configuration',
                        category: getConfigCategory(item),
                        ...stats
                    });
                }
            }
        }

        return configFiles;
    } catch (error) {
        console.error(chalk.red('Erreur lors de la lecture du répertoire:'), error);
        return [];
    }
}

async function displayConfigFiles() {
    const items = await listConfigFiles();
    
    if (items.length === 0) {
        console.log(chalk.yellow('\n  Aucun fichier de configuration trouvé\n'));
        return;
    }

    // Trier par catégorie, puis par type, puis par nom
    items.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        }
        return a.name.localeCompare(b.name);
    });

    // Grouper par catégorie
    const groupedItems = items.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // Calculer la longueur maximale pour l'alignement
    const maxNameLength = Math.max(...items.map(item => item.name.length));

    // Afficher la catégorie principale
    console.log(chalk.blue('\nConfiguration'));
    console.log(chalk.gray('='.repeat(maxNameLength + 20)));

    // Afficher les fichiers par catégorie
    for (const [category, categoryItems] of Object.entries(groupedItems)) {
        console.log(chalk.yellow('\n• ' + category));

        // Sous-grouper par type dans chaque catégorie
        const typeGroups = categoryItems.reduce((acc, item) => {
            acc[item.type] = acc[item.type] || [];
            acc[item.type].push(item);
            return acc;
        }, {});

        for (const [type, files] of Object.entries(typeGroups)) {
            if (Object.keys(typeGroups).length > 1) {
                console.log(chalk.gray('  └─ ' + type));
            }

            files.forEach(file => {
                const size = formatSize(file.size).padStart(10);
                const date = formatDate(file.modified);
                const indent = Object.keys(typeGroups).length > 1 ? '     ' : '  ';
                
                console.log(
                    chalk.gray(indent + '⚙️  ') +
                    chalk.white(file.name.padEnd(maxNameLength + 2)) +
                    chalk.gray(size) + '  ' +
                    chalk.gray(date)
                );
            });
        }
    }

    // Afficher les statistiques
    const stats = {
        total: items.length,
        categories: Object.keys(groupedItems).length,
        types: new Set(items.map(item => item.type)).size,
        totalSize: items.reduce((sum, item) => sum + item.size, 0)
    };

    console.log(chalk.gray('\n' + '='.repeat(maxNameLength + 20)));
    console.log(chalk.blue('Statistiques'));
    console.log(chalk.gray('  Total fichiers:    ') + chalk.white(stats.total));
    console.log(chalk.gray('  Catégories:        ') + chalk.yellow(stats.categories));
    console.log(chalk.gray('  Types distincts:    ') + chalk.yellow(stats.types));
    console.log(chalk.gray('  Taille totale:     ') + chalk.green(formatSize(stats.totalSize)) + '\n');
}

// Exécuter l'affichage
displayConfigFiles().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 