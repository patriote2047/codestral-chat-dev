import { CodePattern } from '../parser/patternAnalyzer';
import { CodeSuggestion, SuggestionType } from './suggestionEngine';

/**
 * Génère des suggestions pour les variables basées sur les patterns existants
 */
export function generateVariableSuggestions(
    currentPatterns: CodePattern[],
    existingPatterns: CodePattern[]
): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Analyse les patterns de variables actuels
    const variablePatterns = currentPatterns.filter((p) => p.type === 'VariablePattern');

    variablePatterns.forEach((pattern) => {
        const structure = pattern.structure as any;

        // Suggestion de constante si approprié
        if (shouldBeConstant(pattern)) {
            suggestions.push({
                type: 'VariableNaming',
                content: `const ${pattern.name}`,
                confidence: 0.9,
                context: {
                    pattern,
                    description: `La variable ${pattern.name} devrait être une constante`,
                },
            });
        }

        // Suggestion de type si pas de type annotation
        if (!structure.hasTypeAnnotation) {
            const inferredType = inferTypeFromName(pattern.name);
            if (inferredType) {
                suggestions.push({
                    type: 'VariableNaming',
                    content: `${pattern.name}: ${inferredType}`,
                    confidence: 0.8,
                    context: {
                        pattern,
                        description: `Suggestion de type pour la variable ${pattern.name}`,
                    },
                });
            }
        }

        // Suggestions basées sur les patterns similaires
        const similarPatterns = findSimilarVariablePatterns(pattern, existingPatterns);
        for (const similarPattern of similarPatterns) {
            const similarity = calculateVariableSimilarity(pattern, similarPattern);
            if (similarity > 0.5) {
                suggestions.push({
                    type: 'VariableNaming',
                    content: generateSimilarVariableImplementation(pattern, similarPattern),
                    confidence: similarity,
                    context: {
                        pattern,
                        description: `Suggestion basée sur la variable similaire ${similarPattern.name}`,
                    },
                });
            }
        }

        // Suggestions pour la documentation
        if (!structure.hasJSDoc) {
            suggestions.push(...generateDocumentationSuggestions(pattern));
        }

        // Suggestions pour les valeurs par défaut
        if (!structure.hasInitializer) {
            const defaultValue = generateDefaultValue(
                structure.type || inferTypeFromName(pattern.name)
            );
            if (defaultValue) {
                suggestions.push({
                    type: 'VariableNaming',
                    content: `${pattern.name} = ${defaultValue}`,
                    confidence: 0.7,
                    context: {
                        pattern,
                        description: `Valeur par défaut pour ${pattern.name}`,
                    },
                });
            }
        }
    });

    return suggestions;
}

/**
 * Trouve les patterns de variables similaires dans le code existant
 */
function findSimilarVariablePatterns(
    pattern: CodePattern,
    existingPatterns: CodePattern[]
): CodePattern[] {
    const variablePatterns = existingPatterns.filter((p) => p.type === 'VariablePattern');

    // Calcule la similarité pour chaque pattern
    const similarPatterns = variablePatterns
        .map((p) => ({
            pattern: p,
            similarity: calculateVariableSimilarity(pattern, p),
        }))
        .filter(({ similarity }) => similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .map(({ pattern }) => pattern);

    return similarPatterns;
}

/**
 * Détermine si deux variables sont similaires basé sur leur structure
 */
function calculateVariableSimilarity(pattern1: CodePattern, pattern2: CodePattern): number {
    const structure1 = pattern1.structure as any;
    const structure2 = pattern2.structure as any;

    let similarity = 0;

    // Compare les types (plus important)
    if (structure1.type === structure2.type) {
        similarity += 0.5;
    } else {
        const type1 = structure1.type || inferTypeFromName(pattern1.name);
        const type2 = structure2.type || inferTypeFromName(pattern2.name);
        if (type1 === type2) {
            similarity += 0.3;
        }
    }

    // Compare les caractéristiques
    if (structure1.kind === structure2.kind) similarity += 0.2;
    if (structure1.hasJSDoc === structure2.hasJSDoc) similarity += 0.1;
    if (structure1.hasInitializer === structure2.hasInitializer) similarity += 0.1;

    // Compare les noms (bonus)
    const name1 = pattern1.name.toLowerCase();
    const name2 = pattern2.name.toLowerCase();
    const commonPrefixes = ['is', 'has', 'get', 'set', 'total', 'count', 'min', 'max'];
    if (commonPrefixes.some((prefix) => name1.startsWith(prefix) && name2.startsWith(prefix))) {
        similarity += 0.1;
    }

    return Math.min(similarity, 1.0);
}

/**
 * Génère une déclaration suggérée basée sur un pattern similaire
 */
function generateSimilarVariableImplementation(
    pattern: CodePattern,
    similarPattern: CodePattern
): string {
    const structure = pattern.structure as any;
    const similarStructure = similarPattern.structure as any;
    const type =
        structure.type || similarStructure.type || inferTypeFromName(pattern.name) || 'any';
    const defaultValue = generateDefaultValue(type);

    let implementation = '';

    // Ajoute la documentation si nécessaire
    if (!structure.hasJSDoc && similarStructure.hasJSDoc) {
        implementation += `/**\n`;
        implementation += ` * ${pattern.name}\n`;
        implementation += ` * Similar to ${similarPattern.name}\n`;
        implementation += ` * @type {${type}}\n`;
        implementation += ` */\n`;
    }

    // Ajoute la déclaration
    implementation += `${structure.kind || similarStructure.kind || 'let'} ${pattern.name}: ${type}`;
    if (defaultValue) {
        implementation += ` = ${defaultValue}`;
    }

    return implementation;
}

/**
 * Infère le type d'une variable basé sur son pattern et les patterns similaires
 */
function inferType(pattern: CodePattern, similarPattern: CodePattern): string {
    const structure = pattern.structure as any;
    if (structure.type) return structure.type;

    const similarStructure = similarPattern.structure as any;
    if (similarStructure.type) return similarStructure.type;

    // Infère le type basé sur le nom
    const name = pattern.name.toLowerCase();
    if (
        name.startsWith('is') ||
        name.startsWith('has') ||
        name.startsWith('should') ||
        name.startsWith('can')
    ) {
        return 'boolean';
    }
    if (
        name.includes('count') ||
        name.includes('total') ||
        name.includes('sum') ||
        name.startsWith('min') ||
        name.startsWith('max')
    ) {
        return 'number';
    }
    if (name.includes('name') || name.includes('label') || name.includes('message')) {
        return 'string';
    }
    if (name.endsWith('s') || name.includes('list') || name.includes('array')) {
        return 'any[]';
    }

    return 'any';
}

/**
 * Génère une valeur par défaut pour un type donné
 */
function generateDefaultValue(type: string | null): string | null {
    if (!type) return null;

    const lowerType = type.toLowerCase();
    switch (lowerType) {
        case 'string':
            return `''`;
        case 'number':
            return '0';
        case 'boolean':
            return 'false';
        case 'object':
            return '{}';
        case 'array':
        case 'any[]':
            return '[]';
        case 'date':
            return 'new Date()';
        default:
            if (type.endsWith('[]')) {
                return '[]';
            }
            return null;
    }
}

/**
 * Vérifie si un pattern de variable a une annotation de type
 */
function hasTypeAnnotation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasTypeAnnotation;
}

/**
 * Vérifie si un pattern de variable a de la documentation
 */
function hasDocumentation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasJSDoc;
}

/**
 * Détermine si une variable devrait être une constante
 */
function shouldBeConstant(pattern: CodePattern): boolean {
    const structure = pattern.structure as any;

    // Si c'est déjà une constante, pas besoin de suggestion
    if (structure.kind === 'const') return false;

    // Si la variable est réassignée, elle ne peut pas être une constante
    if (structure.isReassigned || structure.isMutated) return false;

    // Vérifie si le nom est en majuscules
    if (pattern.name === pattern.name.toUpperCase() && pattern.name.length > 1) return true;

    // Vérifie les préfixes communs pour les constantes
    const constantPrefixes = ['MAX_', 'MIN_', 'DEFAULT_', 'CONSTANT_', 'CONFIG_', 'SETTINGS_'];
    if (constantPrefixes.some((prefix) => pattern.name.toUpperCase().startsWith(prefix)))
        return true;

    // Vérifie si la valeur est un littéral
    if (
        structure.initializer &&
        (structure.initializer.type === 'StringLiteral' ||
            structure.initializer.type === 'NumericLiteral' ||
            structure.initializer.type === 'BooleanLiteral' ||
            structure.initializer.type === 'ObjectLiteral' ||
            structure.initializer.type === 'ArrayLiteral')
    )
        return true;

    return false;
}

/**
 * Génère des suggestions pour les constantes
 */
function generateConstantSuggestions(pattern: CodePattern): CodeSuggestion[] {
    return [
        {
            type: 'VariableNaming',
            content: `const ${pattern.name}`,
            confidence: 0.8,
            context: {
                pattern,
                description: 'Convertir en constante',
            },
        },
    ];
}

/**
 * Génère des suggestions de type pour une variable
 */
function generateTypeAnnotationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const inferredType = inferTypeFromName(pattern.name);
    if (!inferredType) return [];

    return [
        {
            type: 'TypeAnnotation',
            content: `${pattern.name}: ${inferredType}`,
            confidence: 0.8,
            context: {
                pattern,
                description: `Suggestion de type pour la variable ${pattern.name}`,
            },
        },
    ];
}

/**
 * Infère le type d'une variable à partir de son nom
 */
function inferTypeFromName(name: string): string | null {
    const lowerName = name.toLowerCase();

    // Types numériques
    if (
        lowerName.includes('count') ||
        lowerName.includes('index') ||
        lowerName.includes('length') ||
        lowerName.includes('size') ||
        lowerName.includes('amount') ||
        lowerName.includes('total')
    ) {
        return 'number';
    }

    // Types booléens
    if (
        lowerName.startsWith('is') ||
        lowerName.startsWith('has') ||
        lowerName.startsWith('should') ||
        lowerName.startsWith('can') ||
        lowerName.startsWith('will') ||
        lowerName.includes('flag') ||
        lowerName.includes('enabled') ||
        lowerName.includes('visible')
    ) {
        return 'boolean';
    }

    // Types chaîne
    if (
        lowerName.includes('name') ||
        lowerName.includes('title') ||
        lowerName.includes('description') ||
        lowerName.includes('label') ||
        lowerName.includes('message') ||
        lowerName.includes('text') ||
        lowerName.includes('email') ||
        lowerName.includes('phone') ||
        lowerName.includes('address')
    ) {
        return 'string';
    }

    // Types tableau
    if (
        lowerName.endsWith('s') ||
        lowerName.includes('list') ||
        lowerName.includes('array') ||
        lowerName.includes('collection') ||
        lowerName.includes('items')
    ) {
        return 'any[]';
    }

    // Types date
    if (
        lowerName.includes('date') ||
        lowerName.includes('time') ||
        lowerName.includes('timestamp')
    ) {
        return 'Date';
    }

    // Types objet
    if (
        lowerName.includes('options') ||
        lowerName.includes('config') ||
        lowerName.includes('settings') ||
        lowerName.includes('props') ||
        lowerName.includes('params')
    ) {
        return 'object';
    }

    return null;
}

/**
 * Génère des suggestions pour la documentation
 */
function generateDocumentationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const type = structure?.type || 'any';

    let documentation = '/**\n';
    documentation += ` * ${pattern.name}\n`;
    documentation += ` * @type {${type}}\n`;
    documentation += ' */';

    return [
        {
            type: 'VariableNaming',
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
 * Génère des suggestions pour les valeurs par défaut
 */
function generateDefaultValueSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const type = structure?.type || inferType(pattern, pattern);
    const defaultValue = generateDefaultValue(type);

    return [
        {
            type: 'VariableNaming',
            content: `${pattern.name} = ${defaultValue}`,
            confidence: 0.7,
            context: {
                pattern,
                description: `Initialiser avec la valeur par défaut ${defaultValue}`,
            },
        },
    ];
}

/**
 * Vérifie si un pattern de variable a une validation
 */
function hasValidation(pattern: CodePattern): boolean {
    // Implémentation de la vérification de la validation
    return false; // Placeholder, actual implementation needed
}

/**
 * Génère des suggestions pour la validation
 */
function generateValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    // Implémentation de la génération des suggestions de validation
    return []; // Placeholder, actual implementation needed
}

function calculateSimilarityConfidence(similarity: number): number {
    return Math.min(0.7 + similarity * 0.3, 1.0);
}
