import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Analyse les fichiers de tests d'un projet
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} Informations sur les tests du projet
 */
export const analyzeProjectTests = (projectPath) => {
    try {
        const stats = {
            totalTestFiles: 0,
            totalTestSuites: 0,
            totalTests: 0,
            byFramework: {},
            testLocations: []
        };

        const testPatterns = {
            jest: {
                filePatterns: ['.test.', '.spec.', '__tests__'],
                frameworks: ['jest', '@testing-library'],
                configFiles: ['jest.config.js', 'jest.config.ts']
            },
            mocha: {
                filePatterns: ['.test.', '.spec.', 'test/'],
                frameworks: ['mocha', 'chai'],
                configFiles: ['.mocharc.js', '.mocharc.json']
            },
            cypress: {
                filePatterns: ['.cy.', 'cypress/'],
                frameworks: ['cypress'],
                configFiles: ['cypress.config.js', 'cypress.json']
            }
        };

        const ignoreDirs = ['node_modules', '.git', 'build', 'dist', '.next', 'coverage'];

        // Détecter le framework de test utilisé
        const detectTestFramework = () => {
            try {
                const packageJsonPath = join(projectPath, 'package.json');
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };

                for (const [framework, config] of Object.entries(testPatterns)) {
                    if (config.frameworks.some(f => allDeps[f])) {
                        return framework;
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la lecture du package.json:', error);
            }
            return null;
        };

        const mainTestFramework = detectTestFramework();

        const scanDirectory = (dirPath) => {
            const items = readdirSync(dirPath);

            for (const item of items) {
                const fullPath = join(dirPath, item);
                const relativePath = fullPath.replace(projectPath, '').slice(1);
                
                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        if (!ignoreDirs.includes(item)) {
                            // Vérifier si c'est un dossier de tests
                            const isTestDir = Object.values(testPatterns)
                                .some(pattern => 
                                    pattern.filePatterns.some(p => 
                                        item.includes(p) || relativePath.includes(p)
                                    )
                                );

                            if (isTestDir) {
                                stats.testLocations.push({
                                    type: 'directory',
                                    path: relativePath
                                });
                            }

                            scanDirectory(fullPath);
                        }
                    } else {
                        const ext = extname(item).toLowerCase();
                        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                            // Vérifier si c'est un fichier de test
                            const isTestFile = Object.values(testPatterns)
                                .some(pattern => 
                                    pattern.filePatterns.some(p => 
                                        item.includes(p) || relativePath.includes(p)
                                    )
                                );

                            if (isTestFile) {
                                stats.totalTestFiles++;
                                const content = readFileSync(fullPath, 'utf8');
                                
                                // Analyse basique du contenu pour détecter les suites et tests
                                const suiteMatches = content.match(/describe\(|context\(|suite\(/g);
                                const testMatches = content.match(/it\(|test\(|specify\(/g);
                                
                                const suiteCount = suiteMatches ? suiteMatches.length : 0;
                                const testCount = testMatches ? testMatches.length : 0;

                                stats.totalTestSuites += suiteCount;
                                stats.totalTests += testCount;

                                stats.testLocations.push({
                                    type: 'file',
                                    path: relativePath,
                                    suites: suiteCount,
                                    tests: testCount
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Erreur lors de l'analyse de ${fullPath}:`, error);
                }
            }
        };

        scanDirectory(projectPath);

        // Formater les résultats
        const content = [
            {
                type: 'text',
                text: `Projet : ${projectPath}`
            },
            {
                type: 'text',
                text: `${stats.totalTestFiles} fichier${stats.totalTestFiles > 1 ? 's' : ''} de test trouvé${stats.totalTestFiles > 1 ? 's' : ''}`
            },
            { type: 'separator' }
        ];

        // Ajouter les informations sur le framework de test
        content.push({
            type: 'category',
            text: 'Framework de test',
            icon: '🧪'
        });

        if (mainTestFramework) {
            content.push({
                type: 'framework',
                name: mainTestFramework.charAt(0).toUpperCase() + mainTestFramework.slice(1),
                configFiles: testPatterns[mainTestFramework].configFiles
            });
        } else {
            content.push({
                type: 'text',
                text: 'Aucun framework de test détecté'
            });
        }

        // Ajouter les statistiques générales
        content.push({ type: 'separator' });
        content.push({
            type: 'category',
            text: 'Statistiques des tests',
            icon: '📊'
        });

        content.push({
            type: 'stats',
            items: [
                {
                    label: 'Fichiers de test',
                    value: stats.totalTestFiles
                },
                {
                    label: 'Suites de test',
                    value: stats.totalTestSuites
                },
                {
                    label: 'Tests individuels',
                    value: stats.totalTests
                }
            ]
        });

        // Ajouter les emplacements des tests
        if (stats.testLocations.length > 0) {
            content.push({ type: 'separator' });
            content.push({
                type: 'category',
                text: 'Emplacements des tests',
                icon: '📁'
            });

            stats.testLocations.forEach(location => {
                content.push({
                    type: 'testLocation',
                    path: location.path,
                    locationType: location.type,
                    ...(location.type === 'file' && {
                        suites: location.suites,
                        tests: location.tests
                    })
                });
            });
        }

        return {
            type: 'success',
            title: 'Analyse des tests',
            subtitle: `${stats.totalTestFiles} fichier${stats.totalTestFiles > 1 ? 's' : ''} de test, ${stats.totalTests} test${stats.totalTests > 1 ? 's' : ''} au total`,
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                projectPath,
                stats: {
                    totalTestFiles: stats.totalTestFiles,
                    totalTestSuites: stats.totalTestSuites,
                    totalTests: stats.totalTests,
                    framework: mainTestFramework
                }
            }
        };
    } catch (error) {
        return {
            type: 'error',
            content: `Erreur lors de l'analyse des tests : ${error.message}`
        };
    }
}; 