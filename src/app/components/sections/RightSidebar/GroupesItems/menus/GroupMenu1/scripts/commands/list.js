'use client';

import { formatFullCommandOutput } from '../displays/list-display';

export const displayFullCommandList = async () => {
    try {
        // Récupérer le package.json du projet
        const response = await fetch('/api/project/scripts');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des dépendances');
        }

        const data = await response.json();
        console.log('Données reçues:', data); // Pour le débogage

        // Vérifier si nous avons bien les dépendances dans la réponse
        if (!data.dependencies && !data.devDependencies) {
            throw new Error('Aucune dépendance trouvée dans le package.json');
        }

        const dependencies = data.dependencies || {};
        const devDependencies = data.devDependencies || {};

        // Catégoriser les dépendances
        const categorizedDeps = {
            'Framework & Core': {
                'react': dependencies['react'] || devDependencies['react'],
                'next': dependencies['next'] || devDependencies['next'],
                'express': dependencies['express'] || devDependencies['express']
            },
            'Build & Compilation': {
                'webpack': devDependencies['webpack'],
                'babel': devDependencies['@babel/core'],
                'typescript': devDependencies['typescript']
            },
            'Tests & Qualité': {
                'jest': devDependencies['jest'],
                'eslint': devDependencies['eslint'],
                'prettier': devDependencies['prettier']
            },
            'Utilitaires': {
                'lodash': dependencies['lodash'],
                'axios': dependencies['axios'],
                'moment': dependencies['moment']
            },
            'Développement': {
                'nodemon': devDependencies['nodemon'],
                'concurrently': devDependencies['concurrently']
            }
        };

        // Nettoyer les catégories vides et les dépendances undefined
        const cleanedDeps = Object.entries(categorizedDeps).reduce((acc, [category, deps]) => {
            const cleanDeps = Object.entries(deps).reduce((depsAcc, [name, version]) => {
                if (version) {
                    depsAcc[name] = {
                        version,
                        description: `Package ${name} en version ${version}`,
                        type: devDependencies[name] ? 'devDependency' : 'dependency'
                    };
                }
                return depsAcc;
            }, {});

            if (Object.keys(cleanDeps).length > 0) {
                acc[category] = cleanDeps;
            }
            return acc;
        }, {});

        // Ajouter une catégorie "Autres" pour les dépendances non catégorisées
        const categorizedNames = new Set(
            Object.values(categorizedDeps)
                .flatMap(deps => Object.keys(deps))
        );

        const otherDeps = {};
        [...Object.entries(dependencies), ...Object.entries(devDependencies)]
            .forEach(([name, version]) => {
                if (!categorizedNames.has(name)) {
                    otherDeps[name] = {
                        version,
                        description: `Package ${name} en version ${version}`,
                        type: devDependencies[name] ? 'devDependency' : 'dependency'
                    };
                }
            });

        if (Object.keys(otherDeps).length > 0) {
            cleanedDeps['Autres'] = otherDeps;
        }

        // Vérifier si nous avons des dépendances à afficher
        if (Object.keys(cleanedDeps).length === 0) {
            return {
                type: 'error',
                content: 'Aucune dépendance trouvée dans le projet'
            };
        }

        console.log('Dépendances catégorisées:', cleanedDeps); // Pour le débogage
        return formatFullCommandOutput(cleanedDeps);
    } catch (error) {
        console.error('Erreur complète:', error); // Pour le débogage
        return {
            type: 'error',
            content: `Erreur lors de l'analyse des dépendances : ${error.message}`
        };
    }
}; 