// Script d'analyse des dépendances non utilisées
import { recommendedDependencies, getDependenciesByCategory, getAllCategories } from './deps-suggestions/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Règles pour déterminer si une dépendance devrait être en production
const prodOnlyPatterns = [
    /^react(-dom)?$/,
    /^next$/,
    /^socket\.io(-client)?$/,
    /^node-gzip$/,
    /^uuid$/,
    /^typescript$/,
    /^styled-components$/
];

// Règles pour déterminer si une dépendance devrait être en dev
const devOnlyPatterns = [
    /^@babel\//,
    /^@types\//,
    /^@testing-library\//,
    /^@typescript-eslint\//,
    /^@commitlint\//,
    /^eslint/,
    /^jest/,
    /^prettier/,
    /^husky$/,
    /^nodemon$/,
    /^rimraf$/,
    /^glob$/,
    /^npm-/,
    /^babel-/,
    /^identity-obj-proxy$/,
    /^bufferutil$/,
    /^utf-8-validate$/
];

function shouldBeProdDependency(name) {
    return prodOnlyPatterns.some(pattern => pattern.test(name));
}

function shouldBeDevDependency(name) {
    return devOnlyPatterns.some(pattern => pattern.test(name));
}

function generateRecommendation(name, currentType, info) {
    const recommendation = {
        name,
        currentType,
        suggestedType: currentType,
        status: 'correct',
        reason: '',
        alternatives: []
    };

    // Déterminer le type correct
    if (shouldBeProdDependency(name)) {
        recommendation.suggestedType = 'prod';
        if (currentType !== 'prod') {
            recommendation.status = 'wrong-type';
            recommendation.reason = 'Cette dépendance devrait être en production';
        }
    } else if (shouldBeDevDependency(name)) {
        recommendation.suggestedType = 'dev';
        if (currentType !== 'dev') {
            recommendation.status = 'wrong-type';
            recommendation.reason = 'Cette dépendance devrait être en développement';
        }
    }

    // Trouver des alternatives dans la même catégorie
    if (info?.category) {
        const alternatives = Object.entries(recommendedDependencies)
            .filter(([altName, altInfo]) => 
                altInfo.category === info.category && 
                altName !== name &&
                altInfo.type === recommendation.suggestedType
            )
            .slice(0, 3)
            .map(([name, info]) => ({
                name,
                description: info.description
            }));

        recommendation.alternatives = alternatives;
    }

    return recommendation;
}

function displayAnalysis(unusedDeps) {
    console.log(chalk.blue('\n📊 Analyse des dépendances non utilisées\n'));

    // Grouper par catégorie
    const categories = getAllCategories();
    const groupedDeps = {};

    unusedDeps.forEach(dep => {
        const info = recommendedDependencies[dep.name];
        if (info) {
            groupedDeps[info.category] = groupedDeps[info.category] || [];
            groupedDeps[info.category].push(dep);
        } else {
            groupedDeps['Non catégorisé'] = groupedDeps['Non catégorisé'] || [];
            groupedDeps['Non catégorisé'].push(dep);
        }
    });

    // Afficher par catégorie
    Object.entries(groupedDeps).forEach(([category, deps]) => {
        console.log(chalk.yellow(`\n${category}:`));
        
        deps.forEach(dep => {
            const info = recommendedDependencies[dep.name];
            const recommendation = generateRecommendation(dep.name, dep.type, info);

            console.log(chalk.white(`\n  ${dep.name} ${dep.version}`));
            console.log(chalk.gray(`  Type actuel: ${dep.type}`));
            
            if (recommendation.status === 'wrong-type') {
                console.log(chalk.red(`  ⚠️  ${recommendation.reason}`));
                console.log(chalk.gray(`  Type suggéré: ${recommendation.suggestedType}`));
            }

            if (info) {
                console.log(chalk.gray(`  Description: ${info.description}`));
                console.log(chalk.gray('  Cas d\'utilisation:'));
                info.useCases.forEach(useCase => {
                    console.log(chalk.gray(`    • ${useCase}`));
                });
            }

            if (recommendation.alternatives.length > 0) {
                console.log(chalk.gray('\n  Alternatives possibles:'));
                recommendation.alternatives.forEach(alt => {
                    console.log(chalk.gray(`    • ${alt.name}: ${alt.description}`));
                });
            }
        });
    });

    // Statistiques
    const stats = {
        total: unusedDeps.length,
        wrongType: unusedDeps.filter(dep => 
            generateRecommendation(dep.name, dep.type, recommendedDependencies[dep.name]).status === 'wrong-type'
        ).length,
        withAlternatives: unusedDeps.filter(dep => 
            generateRecommendation(dep.name, dep.type, recommendedDependencies[dep.name]).alternatives.length > 0
        ).length
    };

    console.log(chalk.blue('\n📈 Statistiques:'));
    console.log(chalk.gray(`  Total: ${stats.total} dépendances non utilisées`));
    console.log(chalk.gray(`  Mal typées: ${stats.wrongType} dépendances`));
    console.log(chalk.gray(`  Avec alternatives: ${stats.withAlternatives} dépendances`));
}

async function analyzeUnusedDeps() {
    try {
        // Lire package.json
        const pkgJson = JSON.parse(
            await fs.promises.readFile(path.join(ROOT_DIR, 'package.json'), 'utf-8')
        );

        // Récupérer les dépendances non utilisées
        const unusedDeps = [
            ...Object.entries(pkgJson.dependencies || {})
                .map(([name, version]) => ({ name, version, type: 'prod' })),
            ...Object.entries(pkgJson.devDependencies || {})
                .map(([name, version]) => ({ name, version, type: 'dev' }))
        ].filter(dep => {
            // Vérifier si la dépendance est utilisée (à implémenter selon vos besoins)
            return true; // Pour l'exemple, on considère toutes les dépendances
        });

        displayAnalysis(unusedDeps);

    } catch (error) {
        console.error(chalk.red('Erreur lors de l\'analyse:'), error);
        process.exit(1);
    }
}

// Exécuter l'analyse
analyzeUnusedDeps(); 