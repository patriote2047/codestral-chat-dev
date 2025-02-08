import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Analyse récursivement les fichiers d'un projet
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} Informations sur les fichiers du projet
 */
export const analyzeProjectFiles = (projectPath) => {
    try {
        const stats = {
            totalFiles: 0,
            totalSize: 0,
            byExtension: {},
            largestFiles: []
        };

        const ignoreDirs = ['node_modules', '.git', 'build', 'dist', '.next', 'coverage'];
        const MAX_LARGEST_FILES = 10;

        const scanDirectory = (dirPath) => {
            const items = readdirSync(dirPath);

            for (const item of items) {
                const fullPath = join(dirPath, item);
                const relativePath = fullPath.replace(projectPath, '').slice(1);
                
                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        if (!ignoreDirs.includes(item)) {
                            scanDirectory(fullPath);
                        }
                    } else {
                        stats.totalFiles++;
                        stats.totalSize += stat.size;

                        const ext = extname(item).toLowerCase() || '(sans extension)';
                        if (!stats.byExtension[ext]) {
                            stats.byExtension[ext] = {
                                count: 0,
                                size: 0,
                                files: []
                            };
                        }
                        
                        stats.byExtension[ext].count++;
                        stats.byExtension[ext].size += stat.size;
                        stats.byExtension[ext].files.push({
                            name: item,
                            path: relativePath,
                            size: stat.size
                        });

                        // Garder une trace des plus gros fichiers
                        stats.largestFiles.push({
                            name: item,
                            path: relativePath,
                            size: stat.size
                        });
                        stats.largestFiles.sort((a, b) => b.size - a.size);
                        if (stats.largestFiles.length > MAX_LARGEST_FILES) {
                            stats.largestFiles.pop();
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
                text: `${stats.totalFiles} fichier${stats.totalFiles > 1 ? 's' : ''} trouvé${stats.totalFiles > 1 ? 's' : ''}`
            },
            { type: 'separator' }
        ];

        // Ajouter les statistiques par extension
        content.push({
            type: 'category',
            text: 'Types de fichiers',
            icon: '📊'
        });

        Object.entries(stats.byExtension)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([ext, data]) => {
                content.push({
                    type: 'fileType',
                    extension: ext,
                    count: data.count,
                    size: formatSize(data.size)
                });
            });

        // Ajouter les plus gros fichiers
        content.push({ type: 'separator' });
        content.push({
            type: 'category',
            text: 'Plus gros fichiers',
            icon: '📦'
        });

        stats.largestFiles.forEach(file => {
            content.push({
                type: 'file',
                name: file.name,
                path: file.path,
                size: formatSize(file.size)
            });
        });

        return {
            type: 'success',
            title: 'Analyse des fichiers',
            subtitle: `${stats.totalFiles} fichier${stats.totalFiles > 1 ? 's' : ''}, ${formatSize(stats.totalSize)} au total`,
            content,
            metadata: {
                timestamp: new Date().toISOString(),
                projectPath,
                stats: {
                    totalFiles: stats.totalFiles,
                    totalSize: stats.totalSize,
                    extensionCount: Object.keys(stats.byExtension).length
                }
            }
        };
    } catch (error) {
        return {
            type: 'error',
            content: `Erreur lors de l'analyse des fichiers : ${error.message}`
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