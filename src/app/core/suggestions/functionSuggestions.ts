import { CodePattern } from '../parser/patternAnalyzer';
import { CodeSuggestion, SuggestionType } from './suggestionEngine';

/**
 * Génère des suggestions pour les fonctions basées sur les patterns existants
 */
export function generateFunctionSuggestions(
    pattern: CodePattern,
    existingPatterns: CodePattern[]
): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Ne génère pas de suggestions pour les fonctions complètes
    if (isFunctionComplete(pattern)) {
        return suggestions;
    }

    // Suggestions basées sur la similarité
    for (const existingPattern of existingPatterns) {
        if (existingPattern.type === 'FunctionPattern') {
            const similarity = calculatePatternSimilarity(pattern, existingPattern);
            if (similarity > 0.5) {
                suggestions.push({
                    type: 'FunctionCompletion',
                    content: generateSimilarFunctionImplementation(pattern, existingPattern),
                    confidence: similarity,
                    description: `Suggestion basée sur la fonction similaire ${existingPattern.name}`,
                });
            }
        }
    }

    const structure = pattern.structure as any;

    // Suggestions pour la documentation
    if (!structure.hasJSDoc) {
        suggestions.push(...generateDocumentationSuggestions(pattern));
    }

    // Suggestions pour la validation des paramètres
    if (!structure.hasParameterValidation) {
        suggestions.push(...generateValidationSuggestions(pattern));
    }

    // Suggestions pour la gestion des erreurs
    if (!structure.hasErrorHandling) {
        suggestions.push(...generateErrorHandlingSuggestions(pattern));
    }

    return suggestions;
}

/**
 * Trouve les patterns de fonctions similaires dans le code existant
 */
function findSimilarFunctionPatterns(
    pattern: CodePattern,
    existingPatterns: CodePattern[]
): CodePattern[] {
    const functionPatterns = existingPatterns.filter((p) => p.type === 'FunctionPattern');

    return functionPatterns
        .map((p) => ({
            pattern: p,
            similarity: calculatePatternSimilarity(pattern, p),
        }))
        .filter(({ similarity }) => similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .map(({ pattern }) => pattern);
}

/**
 * Détermine si deux fonctions sont similaires basé sur leur structure
 */
function isSimilarFunction(pattern1: CodePattern, pattern2: CodePattern): boolean {
    if (!pattern1.structure || !pattern2.structure) return false;

    const structure1 = pattern1.structure as any;
    const structure2 = pattern2.structure as any;

    // Compare le nombre de paramètres
    const paramCountDiff = Math.abs(
        (structure1.params?.length || 0) - (structure2.params?.length || 0)
    );
    if (paramCountDiff > 1) return false;

    // Compare les types de retour
    if (structure1.returnType && structure2.returnType) {
        if (structure1.returnType === structure2.returnType) return true;
    }

    // Compare les noms (recherche de patterns similaires)
    const name1 = pattern1.name.toLowerCase();
    const name2 = pattern2.name.toLowerCase();

    const commonPrefixes = ['get', 'set', 'create', 'update', 'delete', 'find', 'validate'];
    const hasCommonPrefix = commonPrefixes.some(
        (prefix) => name1.startsWith(prefix) && name2.startsWith(prefix)
    );

    return hasCommonPrefix;
}

/**
 * Calcule un score de confiance pour la similarité entre deux patterns
 */
function calculateSimilarityConfidence(similarity: number): number {
    return Math.min(0.7 + similarity * 0.3, 1.0);
}

/**
 * Génère une implémentation suggérée basée sur un pattern similaire
 */
function generateSimilarFunctionImplementation(
    pattern: CodePattern,
    similarPattern: CodePattern
): string {
    const structure = pattern.structure as any;
    const params = structure.params || [];
    const returnType = structure.returnType || 'void';

    let implementation = '';

    // Ajoute la documentation
    implementation += `/**\n`;
    implementation += ` * ${pattern.name}\n`;
    implementation += ` * Implementation based on ${similarPattern.name}\n`;
    params.forEach((param: any) => {
        implementation += ` * @param ${param.name} ${param.type}\n`;
    });
    implementation += ` * @returns ${returnType}\n`;
    implementation += ` */\n`;

    // Génère la signature de la fonction
    implementation += `function ${pattern.name}(`;
    implementation += params.map((p: any) => `${p.name}: ${p.type}`).join(', ');
    implementation += `): ${returnType} {\n`;

    // Ajoute la validation des paramètres
    params.forEach((param: any) => {
        implementation += `    if (${param.name} === undefined) throw new Error('${param.name} is required');\n`;
    });

    // Ajoute le corps de la fonction
    implementation += `    // TODO: Implement ${pattern.name} similar to ${similarPattern.name}\n`;
    implementation += `    // See ${similarPattern.name} for reference implementation\n`;
    implementation += `}`;

    return implementation;
}

/**
 * Vérifie si un pattern de fonction a de la documentation
 */
function hasDocumentation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasJSDoc;
}

/**
 * Vérifie si un pattern de fonction a de la validation de paramètres
 */
function hasParameterValidation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasParameterValidation;
}

/**
 * Vérifie si un pattern de fonction a de la gestion d'erreurs
 */
function hasErrorHandling(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasErrorHandling;
}

/**
 * Génère des suggestions pour la gestion des erreurs
 */
function generateErrorHandlingSuggestions(pattern: CodePattern): CodeSuggestion[] {
    return [
        {
            type: 'ErrorHandling',
            content: `try {\n    // Original implementation\n} catch (error) {\n    throw new Error(\`Error in ${pattern.name}: \${error.message}\`);\n}`,
            confidence: 0.8,
            context: {
                pattern,
                description: 'Ajouter la gestion des erreurs',
            },
        },
    ];
}

interface FunctionParameter {
    name: string;
    type: string;
}

/**
 * Génère des suggestions pour la validation
 */
function generateValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const params = structure?.params || [];

    return params.map((param: FunctionParameter) => ({
        type: 'Validation',
        content: generateValidationForParameter(param),
        confidence: 0.7,
        context: {
            pattern,
            description: `Ajouter la validation pour le paramètre ${param.name}`,
        },
    }));
}

/**
 * Génère du code de validation pour un paramètre
 */
function generateValidationForParameter(param: FunctionParameter): string {
    switch (param.type) {
        case 'string':
            return `if (typeof ${param.name} !== 'string') throw new Error('${param.name} must be a string');`;
        case 'number':
            return `if (typeof ${param.name} !== 'number') throw new Error('${param.name} must be a number');`;
        case 'boolean':
            return `if (typeof ${param.name} !== 'boolean') throw new Error('${param.name} must be a boolean');`;
        case 'object':
            return `if (!${param.name} || typeof ${param.name} !== 'object') throw new Error('${param.name} must be an object');`;
        case 'array':
        case 'Array':
            return `if (!Array.isArray(${param.name})) throw new Error('${param.name} must be an array');`;
        default:
            if (param.type.endsWith('[]')) {
                return `if (!Array.isArray(${param.name})) throw new Error('${param.name} must be an array');`;
            }
            return `if (!${param.name}) throw new Error('${param.name} must be a ${param.type}');`;
    }
}

/**
 * Génère des suggestions pour la documentation
 */
function generateDocumentationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const params = structure?.params || [];
    const returnType = structure?.returnType || 'void';

    let documentation = '/**\n';
    documentation += ` * ${pattern.name}\n`;
    params.forEach((param: any) => {
        documentation += ` * @param ${param.name} ${param.type}\n`;
    });
    documentation += ` * @returns ${returnType}\n`;
    documentation += ' */';

    return [
        {
            type: 'FunctionCompletion',
            content: documentation,
            confidence: 0.9,
            context: {
                pattern,
                description: 'Ajouter la documentation JSDoc',
            },
        },
    ];
}

/**
 * Vérifie si une fonction est complète (a toutes les fonctionnalités nécessaires)
 */
function isFunctionComplete(pattern: CodePattern): boolean {
    if (!pattern || !pattern.structure) {
        return false;
    }

    const structure = pattern.structure as any;

    // Vérifie si la fonction a tous les éléments requis
    if (
        !structure.hasJSDoc ||
        !structure.hasParameterValidation ||
        !structure.hasErrorHandling ||
        !structure.hasImplementation
    ) {
        return false;
    }

    // Vérifie que tous les paramètres ont des types explicites
    if (structure.params?.some((param: { type: string }) => !param.type || param.type === 'any')) {
        return false;
    }

    // Vérifie que le type de retour est explicite
    if (!structure.returnType || structure.returnType === 'any') {
        return false;
    }

    return true;
}

/**
 * Vérifie si une fonction a une implémentation
 */
function hasImplementation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasImplementation;
}

/**
 * Génère une implémentation de fonction
 */
function generateFunctionImplementation(pattern: CodePattern): string {
    const structure = pattern.structure as any;
    const params = structure.params || [];
    const returnType = structure.returnType || 'void';

    let implementation = '';

    // Ajoute la documentation si nécessaire
    if (!hasDocumentation(pattern)) {
        implementation += `/**\n`;
        implementation += ` * ${pattern.name}\n`;
        params.forEach((param: any) => {
            implementation += ` * @param ${param.name} ${param.type}\n`;
        });
        implementation += ` * @returns ${returnType}\n`;
        implementation += ` */\n`;
    }

    // Génère la signature de la fonction
    implementation += `function ${pattern.name}(`;
    implementation += params.map((p: any) => `${p.name}: ${p.type}`).join(', ');
    implementation += `): ${returnType} {\n`;

    // Ajoute la validation des paramètres si nécessaire
    if (!hasParameterValidation(pattern)) {
        params.forEach((param: any) => {
            if (param.type === 'string') {
                implementation += `    if (!${param.name}) throw new Error('${param.name} is required');\n`;
            } else if (param.type === 'number') {
                implementation += `    if (isNaN(${param.name})) throw new Error('${param.name} must be a number');\n`;
            }
        });
    }

    // Ajoute la gestion des erreurs si nécessaire
    if (!hasErrorHandling(pattern)) {
        implementation += `    try {\n`;
        implementation += `        // TODO: Implement ${pattern.name}\n`;
        implementation += `    } catch (error) {\n`;
        implementation += `        throw new Error(\`Error in ${pattern.name}: \${error.message}\`);\n`;
        implementation += `    }\n`;
    } else {
        implementation += `    // TODO: Implement ${pattern.name}\n`;
    }

    implementation += `}`;

    return implementation;
}

function calculatePatternSimilarity(pattern: CodePattern, otherPattern: CodePattern): number {
    let similarity = 0;
    const structure = pattern.structure as any;
    const otherStructure = otherPattern.structure as any;

    // Compare les types de retour (25% de la similarité)
    if (structure.returnType === otherStructure.returnType) {
        similarity += 0.25;
    }

    // Compare les paramètres (50% de la similarité)
    const paramSimilarity = compareParameters(structure.params, otherStructure.params);
    similarity += paramSimilarity * 0.5;

    // Compare les noms des fonctions (25% de la similarité)
    const nameSimilarity = calculateNameSimilarity(pattern.name, otherPattern.name);
    similarity += nameSimilarity * 0.25;

    return similarity;
}

function compareParameters(params1: any[], params2: any[]): number {
    if (!params1 || !params2 || params1.length === 0 || params2.length === 0) {
        return 0;
    }

    let totalSimilarity = 0;
    const maxParams = Math.max(params1.length, params2.length);

    for (let i = 0; i < Math.min(params1.length, params2.length); i++) {
        if (params1[i].type === params2[i].type) {
            totalSimilarity += 0.7;
        }
        if (params1[i].name === params2[i].name) {
            totalSimilarity += 0.3;
        }
    }

    return totalSimilarity / maxParams;
}

function calculateNameSimilarity(name1: string, name2: string): number {
    const words1 = name1.split(/(?=[A-Z])|[^a-zA-Z0-9]/).filter(Boolean);
    const words2 = name2.split(/(?=[A-Z])|[^a-zA-Z0-9]/).filter(Boolean);

    let commonWords = 0;
    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1.toLowerCase() === word2.toLowerCase()) {
                commonWords++;
                break;
            }
        }
    }

    return commonWords / Math.max(words1.length, words2.length);
}
