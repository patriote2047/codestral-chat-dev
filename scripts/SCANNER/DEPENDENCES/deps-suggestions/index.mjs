// Point d'entrée pour les suggestions de dépendances
import { databaseDeps } from './databases.mjs';
import { serverDeps } from './servers.mjs';
import { compressionDeps } from './compression.mjs';
import { communicationDeps } from './communication.mjs';
import { parsingDeps } from './parsing.mjs';
import { i18nDeps } from './i18n.mjs';
import { monitoringDeps } from './monitoring.mjs';
import { cacheDeps } from './cache.mjs';
import { validationDeps } from './validation.mjs';
import { testingDeps } from './testing.mjs';
import { buildDeps } from './build.mjs';
import { typescriptDeps } from './typescript.mjs';
import { lintingDeps } from './linting.mjs';
import { frameworkDeps } from './framework.mjs';
import { toolsDeps } from './tools.mjs';
import { utilsDeps } from './utils.mjs';

// Fusionner toutes les dépendances
export const recommendedDependencies = {
    ...databaseDeps,
    ...serverDeps,
    ...compressionDeps,
    ...communicationDeps,
    ...parsingDeps,
    ...i18nDeps,
    ...monitoringDeps,
    ...cacheDeps,
    ...validationDeps,
    ...testingDeps,
    ...buildDeps,
    ...typescriptDeps,
    ...lintingDeps,
    ...frameworkDeps,
    ...toolsDeps,
    ...utilsDeps
};

// Fonction pour obtenir les suggestions pour une dépendance
export function getSuggestions(depName) {
    return recommendedDependencies[depName];
}

// Fonction pour trouver des alternatives
export function findAlternatives(depName) {
    const category = Object.entries(recommendedDependencies).find(
        ([name, info]) => name === depName
    )?.[1]?.category;

    if (!category) return [];

    return Object.entries(recommendedDependencies)
        .filter(([name, info]) => 
            info.category === category && name !== depName
        )
        .map(([name, info]) => ({
            name,
            description: info.description
        }));
}

// Fonction pour obtenir toutes les dépendances d'une catégorie
export function getDependenciesByCategory(category) {
    return Object.entries(recommendedDependencies)
        .filter(([_, info]) => info.category === category)
        .reduce((acc, [name, info]) => {
            acc[name] = info;
            return acc;
        }, {});
}

// Fonction pour obtenir toutes les catégories
export function getAllCategories() {
    return [...new Set(
        Object.values(recommendedDependencies)
            .map(info => info.category)
    )];
} 