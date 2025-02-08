import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Analyse la structure des dossiers d'un projet
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} Informations sur la structure des dossiers
 */
export const analyzeProjectFolders = (projectPath) => {
    try {
        const stats = {
            totalFolders: 0,
            totalSize: 0,
            maxDepth: 0,
            largestFolders: [],
            structure: {}
        };

        const ignoreDirs = ['node_modules', '.git', 'build', 'dist', '.next', 'coverage'];
        const MAX_LARGEST_FOLDERS = 10;

        const scanDirectory = (dirPath, depth = 0) => {
            const items = readdirSync(dirPath);
            let folderSize = 0;
            let subFolders = [];

            stats.maxDepth = Math.max(stats.maxDepth, depth);

            for (const item of items) {
                const fullPath = join(dirPath, item);
                const relativePath = fullPath.replace(projectPath, '').slice(1);
                
                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        if (!ignoreDirs.includes(item)) {
                            stats.totalFolders++;
                            const subFolderInfo = scanDirectory(fullPath, depth + 1);
                            folderSize += subFolderInfo.size;
                            subFolders.push({
                                name: item,
                                path: relativePath,
                                size: subFolderInfo.size,
                                fileCount: subFolderInfo.fileCount,
                                subFolderCount: subFolderInfo.subFolderCount
                            });
                        }
                    } else {
                        folderSize += stat.size;
                    }
                } catch (error) {
                    console.error(`Erreur lors de l'analyse de ${fullPath}:`, error);
                }
            }

            // Ajouter aux plus gros dossiers si assez grand
            if (depth > 0) { // Ne pas inclure le dossier racine
                stats.largestFolders.push({
                    name: dirPath.split('\\').pop(),
                    path: dirPath.replace(projectPath, '').slice(1),
                    size: folderSize,
                    fileCount: items.filter(item => {
                        try {
                            return statSync(join(dirPath, item)).isFile();
                        } catch {
                            return false;
                        }
                    }).length,
                    subFolderCount: subFolders.length
                });
                stats.largestFolders.sort((a, b) => b.size - a.size);
                if (stats.largestFolders.length > MAX_LARGEST_FOLDERS) {
                    stats.largestFolders.pop();
                }
            }

            stats.totalSize += folderSize;

            return {
                size: folderSize,
                fileCount: items.filter(item => {
                    try {
                        return statSync(join(dirPath, item)).isFile();
                    } catch {
                        return false;
                    }
                }).length,
                subFolderCount: subFolders.length,
                subFolders
            };
        };

        const rootStats = scanDirectory(projectPath);

        // Formater les résultats
        const content = [
            {
                type: 'text',
                text: `Projet : ${projectPath}`
            },
            {
                type: 'text',
                text: `${stats.totalFolders} dossier${stats.totalFolders > 1 ? 's' : ''} trouvé${stats.totalFolders > 1 ? 's' : ''}`
            },
            { type: 'separator' }
        ];

        // Ajouter les statistiques générales
        content.push({
            type: 'category',
            text: 'Statistiques générales',
            icon: '📊'
        });

        content.push({
            type: 'stats',
            items: [
                {
                    label: 'Profondeur maximale',
                    value: `${stats.maxDepth} niveau${stats.maxDepth > 1 ? 'x' : ''}`
                },
                {
                    label: 'Taille totale',
                    value: formatSize(stats.totalSize)
                },
                {
                    label: 'Fichiers à la racine',
                    value: rootStats.fileCount
                },
                {
                    label: 'Sous-dossiers à la racine',
                    value: rootStats.subFolderCount
                }
            ]
        });

        // Ajouter les plus gros dossiers
        content.push({ type: 'separator' });
        content.push({
            type: 'category',
            text: 'Plus gros dossiers',
            icon: '📁'
        });

        stats.largestFolders.forEach(folder => {
            content.push({
                type: 'folder',
                name: folder.name,
                path: folder.path,
                size: formatSize(folder.size),
                fileCount: folder.fileCount,
                subFolderCount: folder.subFolderCount
            });
        });

        return {
            type: 'success',
            title: 'Analyse des dossiers',
            subtitle: `${stats.totalFolders} dossier${stats.totalFolders > 1 ? 's' : ''}, profondeur max: ${stats.maxDepth}`,
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                projectPath,
                stats: {
                    totalFolders: stats.totalFolders,
                    totalSize: stats.totalSize,
                    maxDepth: stats.maxDepth
                }
            }
        };
    } catch (error) {
        return {
            type: 'error',
            content: `Erreur lors de l'analyse des dossiers : ${error.message}`
        };
    }
};

/**
 * Formate une taille en bytes en une chaîne lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
const formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}; 