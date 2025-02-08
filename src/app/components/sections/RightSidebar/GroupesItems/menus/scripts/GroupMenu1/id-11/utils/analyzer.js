import { promises as fs } from 'fs';
import path from 'path';

/**
 * Analyse un projet et retourne les résultats
 * @param {string} projectPath - Chemin du projet à analyser
 * @param {Object} config - Configuration de l'analyse
 * @returns {Promise<Object>} Résultats de l'analyse
 */
export async function analyzeProject(projectPath, config) {
    const stats = {
        totalFiles: 0,
        fileTypes: {},
        largestFiles: [],
        recentlyModified: [],
        directoryStructure: {}
    };

    async function scanDirectory(dirPath, relativePath = '') {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const dirStats = {
            files: [],
            subdirs: {}
        };

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const entryRelativePath = path.join(relativePath, entry.name);

            // Ignorer les dossiers exclus
            if (entry.isDirectory() && config.options.excludeDirs.includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                dirStats.subdirs[entry.name] = await scanDirectory(fullPath, entryRelativePath);
            } else {
                const ext = path.extname(entry.name).slice(1);
                
                // Filtrer par type de fichier si spécifié
                if (config.options.fileTypes && !config.options.fileTypes.includes(ext)) {
                    continue;
                }

                const fileStats = await fs.stat(fullPath);
                const fileInfo = {
                    name: entry.name,
                    path: entryRelativePath,
                    size: fileStats.size,
                    modified: fileStats.mtime
                };

                stats.totalFiles++;
                stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
                dirStats.files.push(fileInfo);

                // Garder trace des plus gros fichiers
                if (stats.largestFiles.length < 5 || fileStats.size > stats.largestFiles[4]?.size) {
                    stats.largestFiles.push(fileInfo);
                    stats.largestFiles.sort((a, b) => b.size - a.size);
                    stats.largestFiles = stats.largestFiles.slice(0, 5);
                }

                // Garder trace des fichiers récemment modifiés
                if (stats.recentlyModified.length < 10 || fileStats.mtime > stats.recentlyModified[9]?.modified) {
                    stats.recentlyModified.push(fileInfo);
                    stats.recentlyModified.sort((a, b) => b.modified - a.modified);
                    stats.recentlyModified = stats.recentlyModified.slice(0, 10);
                }
            }
        }

        return dirStats;
    }

    try {
        stats.directoryStructure = await scanDirectory(projectPath);
        
        return {
            summary: {
                totalFiles: stats.totalFiles,
                fileTypes: stats.fileTypes
            },
            details: {
                largestFiles: stats.largestFiles,
                recentlyModified: stats.recentlyModified,
                structure: stats.directoryStructure
            }
        };
    } catch (error) {
        throw new Error(`Erreur lors de l'analyse du projet: ${error.message}`);
    }
} 