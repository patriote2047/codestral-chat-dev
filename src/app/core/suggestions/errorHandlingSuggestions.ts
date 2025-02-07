import { CodePattern } from '../parser/patternAnalyzer';
import { CodeSuggestion, SuggestionType } from './suggestionEngine';

/**
 * Génère des suggestions pour la gestion des erreurs basées sur les patterns existants
 */
export function generateErrorHandlingSuggestions(
    currentPatterns: CodePattern[],
    existingPatterns: CodePattern[]
): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Analyse les patterns de fonctions et méthodes
    const functionPatterns = currentPatterns.filter(
        (p) => p.type === 'FunctionPattern' || p.type === 'MethodPattern'
    );

    functionPatterns.forEach((pattern) => {
        // Suggestions pour le try/catch
        if (!hasTryCatch(pattern)) {
            suggestions.push(...generateTryCatchSuggestions(pattern));
        }

        // Suggestions pour la validation d'entrée
        if (!hasInputValidation(pattern)) {
            suggestions.push(...generateInputValidationSuggestions(pattern));
        }

        // Suggestions pour les erreurs personnalisées
        if (!hasCustomErrors(pattern)) {
            suggestions.push(...generateCustomErrorSuggestions(pattern));
        }

        // Suggestions pour la gestion asynchrone
        if (isAsyncFunction(pattern) && !hasAsyncErrorHandling(pattern)) {
            suggestions.push(...generateAsyncErrorHandlingSuggestions(pattern));
        }
    });

    return suggestions;
}

/**
 * Vérifie si un pattern a une structure try/catch
 */
function hasTryCatch(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasTryCatch;
}

/**
 * Vérifie si un pattern a une validation d'entrée
 */
function hasInputValidation(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasInputValidation;
}

/**
 * Vérifie si un pattern utilise des erreurs personnalisées
 */
function hasCustomErrors(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasCustomErrors;
}

/**
 * Vérifie si une fonction est asynchrone
 */
function isAsyncFunction(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.isAsync;
}

/**
 * Vérifie si un pattern a une gestion d'erreurs asynchrone
 */
function hasAsyncErrorHandling(pattern: CodePattern): boolean {
    return !!(pattern.structure as any)?.hasAsyncErrorHandling;
}

/**
 * Génère des suggestions pour l'ajout de try/catch
 */
function generateTryCatchSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const isAsync = structure?.isAsync;
    const returnType = structure?.returnType;

    let implementation = '';
    if (isAsync) {
        implementation = `try {
    // Original implementation
} catch (error) {
    throw new Error(\`Error in ${pattern.name}: \${error.message}\`);
}`;
    } else {
        implementation = `try {
    // Original implementation
} catch (error) {
    throw new Error(\`Error in ${pattern.name}: \${error.message}\`);
}`;
    }

    return [
        {
            type: 'ErrorHandling',
            content: implementation,
            confidence: 0.9,
            context: {
                pattern,
                description: 'Ajouter un bloc try/catch',
            },
        },
    ];
}

/**
 * Génère des suggestions pour la validation d'entrée
 */
function generateInputValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const params = structure?.params || [];

    return params.map((param) => {
        const validation = generateValidationForParameter(param);
        return {
            type: 'ErrorHandling',
            content: validation,
            confidence: 0.8,
            context: {
                pattern,
                description: `Ajouter la validation pour le paramètre ${param.name}`,
            },
        };
    });
}

/**
 * Génère du code de validation pour un paramètre
 */
function generateValidationForParameter(param: any): string {
    const { name, type } = param;

    switch (type) {
        case 'string':
            return `if (typeof ${name} !== 'string' || ${name}.trim() === '') {
    throw new Error('${name} must be a non-empty string');
}`;
        case 'number':
            return `if (typeof ${name} !== 'number' || isNaN(${name})) {
    throw new Error('${name} must be a valid number');
}`;
        case 'boolean':
            return `if (typeof ${name} !== 'boolean') {
    throw new Error('${name} must be a boolean');
}`;
        case 'object':
            return `if (!${name} || typeof ${name} !== 'object') {
    throw new Error('${name} must be an object');
}`;
        case 'array':
        case 'Array':
            return `if (!Array.isArray(${name})) {
    throw new Error('${name} must be an array');
}`;
        default:
            if (type.endsWith('[]')) {
                return `if (!Array.isArray(${name})) {
    throw new Error('${name} must be an array');
}`;
            }
            return `if (${name} === undefined || ${name} === null) {
    throw new Error('${name} is required');
}`;
    }
}

/**
 * Génère des suggestions pour les erreurs personnalisées
 */
function generateCustomErrorSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const name = pattern.name;
    const errorClassName = `${name}Error`;

    const implementation = `class ${errorClassName} extends Error {
    constructor(message: string) {
        super(message);
        this.name = '${errorClassName}';
    }
}

// Usage:
throw new ${errorClassName}('Specific error message');`;

    return [
        {
            type: 'ErrorHandling',
            content: implementation,
            confidence: 0.7,
            context: {
                pattern,
                description: `Créer une classe d'erreur personnalisée pour ${name}`,
            },
        },
    ];
}

/**
 * Génère des suggestions pour la gestion des erreurs asynchrones
 */
function generateAsyncErrorHandlingSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const structure = pattern.structure as any;
    const returnType = structure?.returnType || 'Promise<void>';

    const implementation = `try {
    // Original async implementation
} catch (error) {
    throw new Error(\`Async error in ${pattern.name}: \${error.message}\`);
}`;

    return [
        {
            type: 'ErrorHandling',
            content: implementation,
            confidence: 0.85,
            context: {
                pattern,
                description: 'Ajouter la gestion des erreurs asynchrones',
            },
        },
    ];
}
