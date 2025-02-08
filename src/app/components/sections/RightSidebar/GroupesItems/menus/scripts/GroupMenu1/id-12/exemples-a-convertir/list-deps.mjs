import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Catégories de dépendances
const depCategories = {
    'Tests': [
        'jest',
        'vitest',
        'cypress',
        'mocha',
        'chai',
        'karma',
        '@testing-library',
        'supertest',
        'enzyme'
    ],
    'Correction du code': [
        'eslint',
        'prettier',
        'stylelint',
        'tslint',
        'husky',
        'lint-staged',
        'commitlint'
    ],
    'Build & Compilation': [
        '@babel',
        'typescript',
        'webpack',
        'rollup',
        'vite',
        'esbuild',
        'swc',
        'terser',
        'postcss',
        'sass',
        'less'
    ],
    'Framework & UI': [
        'react',
        'next',
        'vue',
        'nuxt',
        'angular',
        'svelte',
        'tailwindcss',
        'styled-components',
        '@mui',
        '@chakra-ui',
        'bootstrap'
    ],
    'Utilitaires': [
        'lodash',
        'moment',
        'date-fns',
        'uuid',
        'chalk',
        'glob',
        'fs-extra',
        'axios',
        'node-fetch'
    ],
    'Types': [
        '@types'
    ]
};

async function readPackageJson() {
    try {
        const content = await fs.promises.readFile(
            path.join(ROOT_DIR, 'package.json'),
            'utf-8'
        );
        return JSON.parse(content);
    } catch (error) {
        console.error(chalk.red('Erreur lors de la lecture du package.json:'), error);
        return null;
    }
}

async function findImports() {
    const imports = new Set();

    // 1. Analyser les fichiers source
    const files = await glob('**/*.{js,jsx,ts,tsx,mjs,json,config.js}', {
        ignore: ['node_modules/**', 'dist/**', '.next/**', 'build/**', 'coverage/**'],
        cwd: ROOT_DIR
    });

    for (const file of files) {
        try {
            const content = await fs.promises.readFile(path.join(ROOT_DIR, file), 'utf-8');
            
            // Pour les fichiers JSON
            if (file.endsWith('.json')) {
                try {
                    const json = JSON.parse(content);
                    // Vérifier les scripts npm
                    if (json.scripts) {
                        Object.values(json.scripts).forEach(script => {
                            script.split(' ').forEach(word => {
                                if (!word.startsWith('-') && !word.startsWith('/')) {
                                    imports.add(word);
                                }
                            });
                        });
                    }
                } catch (e) {
                    // Ignorer les erreurs de parsing JSON
                }
                continue;
            }

            // Rechercher les imports
            const importMatches = content.match(/from ['"]([^'"]+)['"]/g) || [];
            const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
            const configMatches = content.match(/(?:extends|plugins|presets).*['"]([^'"]+)['"]/g) || [];
            
            importMatches.forEach(match => {
                const pkg = match.match(/from ['"]([^'"]+)['"]/)[1];
                if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
                    imports.add(pkg.split('/')[0]);
                }
            });

            requireMatches.forEach(match => {
                const pkg = match.match(/require\(['"]([^'"]+)['"]\)/)[1];
                if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
                    imports.add(pkg.split('/')[0]);
                }
            });

            configMatches.forEach(match => {
                const pkg = match.match(/['"]([^'"]+)['"]/)[1];
                if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
                    imports.add(pkg.split('/')[0]);
                }
            });

        } catch (error) {
            // Ignorer les erreurs de lecture
        }
    }

    // 2. Ajouter les dépendances implicites
    const implicitDeps = {
        'next': ['react', 'react-dom'],
        'jest': ['jest-environment-jsdom'],
        'eslint': ['@typescript-eslint/parser', '@typescript-eslint/eslint-plugin'],
        'typescript': ['@types/node'],
        'socket.io': ['bufferutil', 'utf-8-validate'],
        'react': ['@types/react', '@types/react-dom']
    };

    // Ajouter les dépendances implicites pour chaque package trouvé
    for (const [pkg, deps] of Object.entries(implicitDeps)) {
        if (imports.has(pkg)) {
            deps.forEach(dep => imports.add(dep));
        }
    }

    return imports;
}

function getDepCategory(depName) {
    for (const [category, patterns] of Object.entries(depCategories)) {
        if (patterns.some(pattern => 
            depName.startsWith(pattern) || 
            depName.includes(pattern)
        )) {
            return category;
        }
    }
    return 'Autres';
}

function formatDepName(name, version, isUsed) {
    const nameStr = chalk.white(name.padEnd(30));
    const versionStr = chalk.gray(version.padEnd(15));
    const usageStr = isUsed 
        ? chalk.green('✓ utilisé')
        : chalk.yellow('⚠ non-utilisé');
    return `${nameStr}${versionStr}${usageStr}`;
}

async function analyzeDependencies() {
    const pkgJson = await readPackageJson();
    if (!pkgJson) return;

    const usedDeps = await findImports();
    const allDeps = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies
    };

    // Grouper les dépendances par catégorie
    const groupedDeps = {};
    for (const [name, version] of Object.entries(allDeps)) {
        const category = getDepCategory(name);
        groupedDeps[category] = groupedDeps[category] || [];
        groupedDeps[category].push({
            name,
            version,
            isUsed: usedDeps.has(name),
            isDev: pkgJson.devDependencies?.[name] !== undefined
        });
    }

    // Afficher les résultats
    console.log(chalk.blue('\nDépendances'));
    console.log(chalk.gray('='.repeat(60)));

    for (const [category, deps] of Object.entries(groupedDeps)) {
        console.log(chalk.yellow(`\n• ${category}`));
        
        // Trier par utilisation puis par nom
        deps.sort((a, b) => {
            if (a.isUsed !== b.isUsed) return b.isUsed - a.isUsed;
            return a.name.localeCompare(b.name);
        });

        // Séparer prod et dev dans chaque catégorie
        const prodDeps = deps.filter(d => !d.isDev);
        const devDeps = deps.filter(d => d.isDev);

        if (prodDeps.length > 0) {
            if (devDeps.length > 0) console.log(chalk.gray('  └─ Production'));
            prodDeps.forEach(dep => {
                console.log('     ' + formatDepName(dep.name, dep.version, dep.isUsed));
            });
        }

        if (devDeps.length > 0) {
            if (prodDeps.length > 0) console.log(chalk.gray('\n  └─ Développement'));
            devDeps.forEach(dep => {
                console.log('     ' + formatDepName(dep.name, dep.version, dep.isUsed));
            });
        }
    }

    // Calculer les statistiques
    const stats = {
        total: Object.keys(allDeps).length,
        used: Object.entries(groupedDeps).reduce((count, [_, deps]) => 
            count + deps.filter(d => d.isUsed).length, 0),
        prod: Object.keys(pkgJson.dependencies || {}).length,
        dev: Object.keys(pkgJson.devDependencies || {}).length,
        categories: Object.keys(groupedDeps).length
    };

    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.blue('Statistiques'));
    console.log(chalk.gray('  Total:            ') + chalk.white(stats.total));
    console.log(chalk.gray('  Production:       ') + chalk.white(stats.prod));
    console.log(chalk.gray('  Développement:    ') + chalk.white(stats.dev));
    console.log(chalk.gray('  Utilisées:        ') + chalk.green(stats.used));
    console.log(chalk.gray('  Non-utilisées:    ') + chalk.yellow(stats.total - stats.used));
    console.log(chalk.gray('  Catégories:       ') + chalk.white(stats.categories) + '\n');
}

// Exécuter l'analyse
analyzeDependencies().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 