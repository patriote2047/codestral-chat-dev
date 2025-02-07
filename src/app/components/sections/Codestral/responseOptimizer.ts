import { ResponseOptimizer, OptimizationMetrics, CacheEntry } from './types';
import { gzip, ungzip } from 'node-gzip';

const MAX_CACHE_SIZE = 1000;
const COMPRESSION_THRESHOLD = 1000;

function formatCode(code: string, language: string): string {
    // Pré-traitement pour les fonctions simples
    code = code.replace(
        /function\s+(\w+)\s*\(\s*\)\s*{\s*return\s+([^;]+)\s*}/g,
        (match, name, expr) => `function ${name}() {\n  return ${expr};\n}`
    );

    // Formatage basique du code
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
        let formatted = line.trim();

        // Ajuster l'indentation pour les accolades fermantes avant d'ajouter l'indentation
        if (formatted.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        // Ajouter l'indentation si la ligne n'est pas vide
        if (formatted.length > 0) {
            // Indenter toutes les lignes sauf les accolades fermantes seules
            if (formatted !== '}') {
                formatted = '  '.repeat(indentLevel) + formatted;
            } else {
                formatted = '  '.repeat(Math.max(0, indentLevel)) + formatted;
            }
        }

        // Ajuster l'indentation pour les accolades ouvrantes après avoir ajouté l'indentation
        if (formatted.includes('{') && !formatted.includes('}')) {
            indentLevel++;
        }

        // Ajouter des espaces autour des opérateurs et formater la syntaxe
        formatted = formatted
            .replace(/([=+\-*/<>])/g, ' $1 ') // Espaces autour des opérateurs
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .replace(/\(\s+/g, '(') // Supprimer les espaces après (
            .replace(/\s+\)/g, ')') // Supprimer les espaces avant )
            .replace(/{\s*/g, ' {') // Normaliser l'espace avant {
            .replace(/\s*}/g, ' }') // Normaliser l'espace avant }
            .replace(/;\s*/g, ';') // Supprimer les espaces après ;
            .replace(/([^;{])\s*$/g, '$1;') // Ajouter ; si manquant et pas de {
            .replace(/}\s*;/g, '}') // Supprimer ; après }
            .replace(/function\s*\(/g, 'function (') // Espace après function
            .replace(/\)\s*{/g, ') {') // Espace entre ) et {
            .replace(/{\s*}/g, ' { }') // Normaliser les blocs vides
            .replace(/return\s+([^;]*);?/g, 'return $1;') // Formater les return
            .trim();

        return formatted;
    });

    // Post-traitement pour les fonctions simples
    const result = formattedLines
        .join('\n')
        .replace(
            /function\s+(\w+)\s*\(\s*\)\s*{\s*\n\s*return\s+([^;]+);\s*\n\s*}/g,
            (match, name, expr) => `function ${name}() {\n  return ${expr};\n}`
        );

    return result;
}

export function initializeResponseOptimizer(): ResponseOptimizer {
    const cache = new Map<string, CacheEntry>();
    let metrics: OptimizationMetrics = {
        averageResponseTime: 0,
        cacheHitRate: 0,
        compressionRatio: 1,
        cacheSize: 0,
        maxCacheSize: MAX_CACHE_SIZE,
    };

    let totalResponseTime = 0;
    let responseCount = 0;
    let cacheHits = 0;
    let cacheMisses = 0;

    return {
        format(input: string): string {
            // Détecter les blocs de code
            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
            return input.replace(codeBlockRegex, (match, language, code) => {
                if (language && ['typescript', 'javascript', 'jsx', 'tsx'].includes(language)) {
                    const formattedCode = formatCode(code.trim(), language);
                    return `\`\`\`${language}\n${formattedCode}\n\`\`\``;
                }
                return match;
            });
        },

        async compress(data: string): Promise<string> {
            if (!data) {
                this.recordMetric('compressionRatio', 1);
                return '';
            }

            if (data.length < COMPRESSION_THRESHOLD) {
                this.recordMetric('compressionRatio', 1);
                return data;
            }

            try {
                const buffer = Buffer.from(data, 'utf-8');
                const compressed = await gzip(buffer);
                const compressionRatio = buffer.length / compressed.length;
                this.recordMetric('compressionRatio', compressionRatio);
                return `GZIP:${compressed.toString('base64')}`;
            } catch (error) {
                console.error('Erreur de compression:', error);
                this.recordMetric('compressionRatio', 1);
                return data;
            }
        },

        async decompress(data: string): Promise<string> {
            if (!data.startsWith('GZIP:')) {
                return data;
            }

            try {
                const compressedData = data.slice(5); // Enlever le préfixe "GZIP:"
                const buffer = Buffer.from(compressedData, 'base64');
                const decompressed = await ungzip(buffer);
                return decompressed.toString('utf-8');
            } catch (error) {
                console.error('Erreur de décompression:', error);
                return data;
            }
        },

        cacheResponse(query: string, response: string): void {
            const entry: CacheEntry = {
                response,
                timestamp: Date.now(),
                accessCount: 0,
            };

            // Si le cache est plein, supprimer l'entrée la moins récemment utilisée
            if (cache.size >= MAX_CACHE_SIZE) {
                let lruKey = '';
                let lowestScore = Number.MAX_SAFE_INTEGER;

                const now = Date.now();
                for (const [key, value] of cache.entries()) {
                    // Calculer un score basé sur le temps écoulé et le nombre d'accès
                    const timeScore = (now - value.timestamp) / 1000; // Secondes écoulées
                    const accessScore = value.accessCount * 10; // Bonus pour chaque accès
                    const score = accessScore / (timeScore + 1); // Plus le score est bas, plus l'entrée est candidate à l'éviction

                    if (score < lowestScore) {
                        lowestScore = score;
                        lruKey = key;
                    }
                }

                if (lruKey) {
                    cache.delete(lruKey);
                }
            }

            cache.set(query, entry);
            metrics.cacheSize = cache.size;
        },

        getCachedResponse(query: string): string | null {
            const entry = cache.get(query);
            if (entry) {
                entry.accessCount++;
                entry.timestamp = Date.now();
                cacheHits++;
                return entry.response;
            }
            cacheMisses++;
            return null;
        },

        recordMetric(metricName: string, value: number): void {
            switch (metricName) {
                case 'responseTime':
                    totalResponseTime += value;
                    responseCount++;
                    metrics.averageResponseTime = totalResponseTime / responseCount;
                    break;
                case 'compressionRatio':
                    metrics.compressionRatio = value;
                    break;
            }
        },

        getMetrics(): OptimizationMetrics {
            return {
                ...metrics,
                cacheHitRate: cacheHits / (cacheHits + cacheMisses) || 0,
            };
        },
    };
}
