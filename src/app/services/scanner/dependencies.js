import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Lit et analyse les dépendances du package.json
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} Informations sur les dépendances
 */
export const getProjectDependencies = (projectPath) => {
    try {
        const packageJsonPath = join(projectPath, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};
        const peerDependencies = packageJson.peerDependencies || {};
        
        const depCount = Object.keys(dependencies).length;
        const devDepCount = Object.keys(devDependencies).length;
        const peerDepCount = Object.keys(peerDependencies).length;
        const totalCount = depCount + devDepCount + peerDepCount;

        if (totalCount === 0) {
            return {
                type: 'error',
                content: 'Aucune dépendance trouvée dans le package.json'
            };
        }

        const content = [
            {
                type: 'text',
                text: `Projet : ${projectPath}`
            },
            {
                type: 'text',
                text: `${totalCount} dépendance${totalCount > 1 ? 's' : ''} trouvée${totalCount > 1 ? 's' : ''}`
            },
            { type: 'separator' }
        ];

        // Ajouter les dépendances principales
        if (depCount > 0) {
            content.push({
                type: 'category',
                text: 'Dépendances principales',
                icon: '📦'
            });

            Object.entries(dependencies).forEach(([name, version]) => {
                content.push({
                    type: 'dependency',
                    name,
                    version,
                    type: 'main'
                });
            });
        }

        // Ajouter les dépendances de développement
        if (devDepCount > 0) {
            content.push({
                type: 'category',
                text: 'Dépendances de développement',
                icon: '🔧'
            });

            Object.entries(devDependencies).forEach(([name, version]) => {
                content.push({
                    type: 'dependency',
                    name,
                    version,
                    type: 'dev'
                });
            });
        }

        // Ajouter les dépendances peer
        if (peerDepCount > 0) {
            content.push({
                type: 'category',
                text: 'Dépendances peer',
                icon: '🤝'
            });

            Object.entries(peerDependencies).forEach(([name, version]) => {
                content.push({
                    type: 'dependency',
                    name,
                    version,
                    type: 'peer'
                });
            });
        }

        return {
            type: 'success',
            title: 'Dépendances du projet',
            subtitle: `${totalCount} dépendance${totalCount > 1 ? 's' : ''} (${depCount} principales, ${devDepCount} dev, ${peerDepCount} peer)`,
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                projectPath,
                stats: {
                    main: depCount,
                    dev: devDepCount,
                    peer: peerDepCount,
                    total: totalCount
                }
            }
        };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {
                type: 'error',
                content: 'Aucun fichier package.json trouvé dans le projet'
            };
        }
        return {
            type: 'error',
            content: `Erreur lors de la lecture du package.json : ${error.message}`
        };
    }
}; 