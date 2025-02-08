import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import chalk from 'chalk';
import { getSuggestions, findAlternatives, recommendedDependencies } from './deps-suggestions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Fonction pour obtenir la catégorie d'une dépendance
function getDependencyCategory(depName) {
    for (const [name, info] of Object.entries(recommendedDependencies)) {
        if (name === depName) {
            // Trouver la catégorie en analysant la position dans l'objet
            const categories = Object.keys(recommendedDependencies);
            let currentCategory = 'Autres';
            for (let i = 0; i < categories.length; i++) {
                if (categories[i] === name) {
                    // Remonter jusqu'au commentaire de catégorie
                    for (let j = i; j >= 0; j--) {
                        const comment = categories[j];
                        if (comment.startsWith('//')) {
                            currentCategory = comment.replace('//', '').trim();
                            break;
                        }
                    }
                    break;
                }
            }
            return {
                category: currentCategory,
                type: info.type
            };
        }
    }
    return { category: 'Autres', type: 'unknown' };
}

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

async function findDependencyUsage() {
    const pkgJson = await readPackageJson();
    if (!pkgJson) return null;

    const allDeps = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies
    };

    // Initialiser le suivi d'utilisation
    const usage = {};
    for (const dep of Object.keys(allDeps)) {
        usage[dep] = {
            files: new Set(),
            imports: new Set(),
            isDev: pkgJson.devDependencies?.[dep] !== undefined,
            version: allDeps[dep]
        };
    }

    // Trouver tous les fichiers à analyser
    const files = await glob('**/*.{js,jsx,ts,tsx,mjs,json,config.js}', {
        ignore: ['node_modules/**', 'dist/**', '.next/**', 'build/**', 'coverage/**'],
        cwd: ROOT_DIR
    });

    // Analyser chaque fichier
    for (const file of files) {
        try {
            const content = await fs.promises.readFile(path.join(ROOT_DIR, file), 'utf-8');
            const relativePath = path.relative(ROOT_DIR, path.join(ROOT_DIR, file));

            // Pour les fichiers JSON
            if (file.endsWith('.json')) {
                try {
                    const json = JSON.parse(content);
                    // Vérifier les scripts npm
                    if (json.scripts) {
                        Object.values(json.scripts).forEach(script => {
                            script.split(' ').forEach(word => {
                                if (usage[word]) {
                                    usage[word].files.add(relativePath);
                                    usage[word].imports.add('Script: ' + script);
                                }
                            });
                        });
                    }
                } catch (e) {
                    // Ignorer les erreurs de parsing JSON
                }
                continue;
            }

            // Rechercher les imports et requires
            const patterns = [
                { regex: /from ['"]([^'"]+)['"]/g, type: 'Import' },
                { regex: /require\(['"]([^'"]+)['"]\)/g, type: 'Require' },
                { regex: /(?:extends|plugins|presets).*['"]([^'"]+)['"]/g, type: 'Config' }
            ];

            for (const { regex, type } of patterns) {
                const matches = content.matchAll(regex);
                for (const match of matches) {
                    const pkg = match[1].split('/')[0];
                    if (usage[pkg]) {
                        usage[pkg].files.add(relativePath);
                        usage[pkg].imports.add(type + ': ' + match[0].trim());
                    }
                }
            }
        } catch (error) {
            // Ignorer les erreurs de lecture
        }
    }

    return usage;
}

function formatImportList(imports) {
    return Array.from(imports)
        .map(imp => '      ' + chalk.gray(imp))
        .join('\n');
}

function formatFileList(files) {
    return Array.from(files)
        .map(file => '      ' + chalk.blue(file))
        .join('\n');
}

async function displayDependencyUsage() {
    console.log(chalk.blue('\nAnalyse de l\'utilisation des dépendances'));
    console.log(chalk.gray('='.repeat(60)));

    const usage = await findDependencyUsage();
    if (!usage) return;

    // Grouper les dépendances par catégorie
    const groupedDeps = {};
    for (const [name, data] of Object.entries(usage)) {
        const { category, type } = getDependencyCategory(name);
        groupedDeps[category] = groupedDeps[category] || [];
        groupedDeps[category].push({ name, ...data, type });
    }

    // Statistiques
    const stats = {
        total: Object.keys(usage).length,
        used: 0,
        unused: 0,
        prod: 0,
        dev: 0,
        recommended: 0,
        notRecommended: 0
    };

    // Afficher les résultats par catégorie
    for (const [category, deps] of Object.entries(groupedDeps)) {
        console.log(chalk.yellow(`\n• ${category}`));
        
        // Trier les dépendances par utilisation puis par nom
        deps.sort((a, b) => {
            if (a.files.size !== b.files.size) return b.files.size - a.files.size;
            return a.name.localeCompare(b.name);
        });

        for (const dep of deps) {
            const fileCount = dep.files.size;
            const isRecommended = !!recommendedDependencies[dep.name];

            // Mettre à jour les stats
            if (fileCount > 0) stats.used++;
            else stats.unused++;
            if (dep.isDev) stats.dev++;
            else stats.prod++;
            if (isRecommended) stats.recommended++;
            else stats.notRecommended++;

            console.log(chalk.white(`\n${dep.name} ${chalk.gray('v' + dep.version)}`));
            console.log(chalk.gray('  Type: ') + (dep.isDev ? chalk.blue('Développement') : chalk.green('Production')));
            console.log(chalk.gray('  Statut: ') + (isRecommended ? chalk.green('Recommandée') : chalk.yellow('Non listée')));
            
            if (fileCount > 0) {
                console.log(chalk.gray('  Utilisé dans ') + chalk.green(fileCount) + chalk.gray(' fichier(s):'));
                console.log(formatFileList(dep.files));
                console.log(chalk.gray('\n  Imports trouvés:'));
                console.log(formatImportList(dep.imports));
            } else {
                console.log(chalk.yellow('  ⚠ Non utilisé dans le projet'));
            }

            // Afficher les suggestions si disponible
            const suggestions = getSuggestions(dep.name);
            if (suggestions) {
                console.log(chalk.blue('\n  💡 Utilisation recommandée:'));
                console.log(chalk.gray('  Description: ') + chalk.white(suggestions.description));
                console.log(chalk.gray('  Cas d\'utilisation:'));
                suggestions.useCases.forEach(useCase => {
                    console.log(chalk.gray('    • ') + chalk.white(useCase));
                });
            }

            // Si non utilisé, suggérer des alternatives
            if (fileCount === 0) {
                const alternatives = findAlternatives(dep.name);
                if (alternatives.length > 0) {
                    console.log(chalk.blue('\n  💡 Alternatives possibles:'));
                    alternatives.slice(0, 3).forEach(alt => {
                        console.log(chalk.gray('    • ') + chalk.green(alt.name) + chalk.gray(': ' + alt.description));
                    });
                }
            }
        }
    }

    // Afficher les statistiques
    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.blue('Statistiques'));
    console.log(chalk.gray('  Total:            ') + chalk.white(stats.total));
    console.log(chalk.gray('  Production:       ') + chalk.white(stats.prod));
    console.log(chalk.gray('  Développement:    ') + chalk.white(stats.dev));
    console.log(chalk.gray('  Utilisées:        ') + chalk.green(stats.used));
    console.log(chalk.gray('  Non-utilisées:    ') + chalk.yellow(stats.unused));
    console.log(chalk.gray('  Recommandées:     ') + chalk.green(stats.recommended));
    console.log(chalk.gray('  Non listées:      ') + chalk.yellow(stats.notRecommended) + '\n');
}

// Exécuter l'analyse
displayDependencyUsage().catch(error => {
    console.error(chalk.red('\n❌ Erreur fatale:'), error);
    process.exit(1);
}); 