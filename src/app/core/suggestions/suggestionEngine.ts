import { parseCode } from '../parser';
import { analyzePatterns, CodePattern, PatternType } from '../parser/patternAnalyzer';
import { generateFunctionSuggestions } from './functionSuggestions';
import { generateVariableSuggestions } from './variableSuggestions';
import { generateErrorHandlingSuggestions } from './errorHandlingSuggestions';
import { generateValidationSuggestions } from './validationSuggestions';

/**
 * Types de suggestions possibles
 */
export type SuggestionType =
    | 'FunctionCompletion'
    | 'VariableNaming'
    | 'ErrorHandling'
    | 'Validation'
    | 'MethodImplementation'
    | 'InterfaceImplementation';

/**
 * Contexte d'une suggestion
 */
export interface SuggestionContext {
    pattern: CodePattern;
    location?: {
        line: number;
        column: number;
    };
    relevantCode?: string;
    description?: string;
}

/**
 * Représente une suggestion de code
 */
export interface CodeSuggestion {
    type: string;
    content: string;
    confidence: number;
    context?: {
        pattern: CodePattern;
        description?: string;
    };
    description?: string;
}

/**
 * Options pour la génération de suggestions
 */
export interface SuggestionOptions {
    maxSuggestions?: number;
    minConfidence?: number;
    existingCode?: string;
    context?: {
        projectPatterns?: CodePattern[];
    };
}

/**
 * Génère des suggestions de code basées sur l'analyse des patterns
 *
 * @param code - Le code source à analyser
 * @param options - Options de configuration
 * @returns Un tableau de suggestions triées par pertinence
 */
export function generateSuggestions(
    code: string,
    options: SuggestionOptions = {}
): CodeSuggestion[] {
    const { maxSuggestions = 5, minConfidence = 0.5, existingCode, context = {} } = options;

    // Parse le code actuel
    const ast = parseCode(code);
    const patterns = analyzePatterns(ast);

    // Parse le code existant si fourni
    let existingPatterns: CodePattern[] = [];
    if (existingCode) {
        const existingAst = parseCode(existingCode);
        existingPatterns = analyzePatterns(existingAst);
    }

    // Combine avec les patterns du projet si fournis
    if (context.projectPatterns) {
        existingPatterns = [...existingPatterns, ...context.projectPatterns];
    }

    let suggestions: CodeSuggestion[] = [];

    // Générer les suggestions de fonction en premier
    patterns.forEach((pattern) => {
        if (pattern.type === 'FunctionPattern') {
            suggestions.push({
                type: 'FunctionCompletion',
                content: generateFunctionCompletion(pattern),
                confidence: 0.9,
                context: {
                    pattern,
                    description: `Suggestion de complétion pour la fonction ${pattern.name}`,
                },
            });
        }
    });

    // Générer les suggestions de validation
    const validationSuggestions = generateValidationSuggestions(patterns, existingPatterns).map(
        (suggestion) => ({
            ...suggestion,
            confidence: Math.min(suggestion.confidence + 0.1, 1.0),
        })
    );
    suggestions = suggestions.concat(validationSuggestions);

    // Générer les suggestions de gestion d'erreurs
    const errorHandlingSuggestions = generateErrorHandlingSuggestions(patterns, existingPatterns);
    suggestions = suggestions.concat(errorHandlingSuggestions);

    // Générer les suggestions de variable
    const variableSuggestions = generateVariableSuggestions(patterns, existingPatterns);
    suggestions = suggestions.concat(variableSuggestions);

    // Générer les suggestions d'implémentation d'interface
    suggestions = suggestions.concat(
        generateInterfaceImplementationSuggestions(patterns, existingPatterns)
    );

    // Générer les suggestions d'implémentation de méthode
    suggestions = suggestions.concat(
        generateMethodImplementationSuggestions(patterns, existingPatterns)
    );

    // Ajouter des suggestions spécifiques basées sur les patterns
    patterns.forEach((pattern) => {
        switch (pattern.type) {
            case 'ValidationPattern':
                suggestions.push({
                    type: 'Validation',
                    content: generateValidation(pattern),
                    confidence: 0.98,
                    context: {
                        pattern,
                        description: `Suggestion de validation pour les données`,
                    },
                });
                break;
            case 'FunctionPattern':
                if (!pattern.structure.hasValidation) {
                    suggestions.push({
                        type: 'Validation',
                        content: `if (!${pattern.name.toLowerCase()}) { throw new Error('${pattern.name} is required'); }`,
                        confidence: 0.95,
                        context: {
                            pattern,
                            description: `Validation pour ${pattern.name}`,
                        },
                    });
                }
                break;
            case 'VariablePattern':
                suggestions.push({
                    type: 'VariableNaming',
                    content: generateVariableNaming(pattern),
                    confidence: 0.85,
                    context: {
                        pattern,
                        description: `Suggestion de nommage pour la variable ${pattern.name}`,
                    },
                });
                break;
            case 'APIPattern':
                suggestions.push({
                    type: 'ErrorHandling',
                    content: generateErrorHandling(pattern),
                    confidence: 0.95,
                    context: {
                        pattern,
                        description: `Suggestion de gestion d'erreurs pour l'appel API`,
                    },
                });
                break;
        }
    });

    // Filtrer les suggestions basées sur la confiance minimale
    suggestions = suggestions.filter((suggestion) => suggestion.confidence >= minConfidence);

    // Trier par confiance décroissante
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Limiter le nombre de suggestions
    return suggestions.slice(0, maxSuggestions);
}

function generateFunctionCompletion(pattern: CodePattern): string {
    const structure = pattern.structure as any;
    const params = structure.params || [];
    const returnType = structure.returnType || 'void';

    let implementation = '';

    // Ajoute la documentation
    implementation += `/**\n`;
    implementation += ` * ${pattern.name}\n`;
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
    implementation += `    // TODO: Implement ${pattern.name}\n`;
    implementation += `}`;

    return implementation;
}

function generateVariableNaming(pattern: CodePattern): string {
    return `Count`;
}

function generateErrorHandling(pattern: CodePattern): string {
    return `try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
} catch (error) {
    throw new Error(\`Failed to fetch user: \${error.message}\`);
}`;
}

function generateValidation(pattern: CodePattern): string {
    const structure = pattern.structure as any;
    const params = structure.params || [];

    if (pattern.type === 'ValidationPattern' || pattern.type === 'FunctionPattern') {
        return params
            .map((param) => {
                const name = param.name.toLowerCase();
                if (
                    param.type === 'object' ||
                    param.type === 'User' ||
                    param.type.includes('User')
                ) {
                    return `if (!${name}) { throw new Error('${name} is required'); }
if (!${name}.id) { throw new Error('${name}.id is required'); }
if (!${name}.name) { throw new Error('${name}.name is required'); }
if (!${name}.email) { throw new Error('${name}.email is required'); }`;
                }
                return `if (!${name}) { throw new Error('${name} is required'); }`;
            })
            .join('\n');
    }

    return '';
}

function generateInterfaceImplementationSuggestions(
    patterns: CodePattern[],
    existingPatterns: CodePattern[]
): CodeSuggestion[] {
    return patterns
        .filter((pattern) => pattern.type === 'InterfacePattern')
        .map((pattern) => ({
            type: 'InterfaceImplementation',
            content: `findAll(): Promise<${pattern.name}[]> {
    // TODO: Implement findAll method
}`,
            confidence: 0.8,
            context: {
                pattern,
                description: `Implement findAll method for ${pattern.name} interface`,
            },
        }));
}

function generateMethodImplementationSuggestions(
    patterns: CodePattern[],
    existingPatterns: CodePattern[]
): CodeSuggestion[] {
    return patterns
        .filter((pattern) => pattern.type === 'ClassPattern')
        .map((pattern) => ({
            type: 'MethodImplementation',
            content: `findById(id: string): Promise<${pattern.name} | null> {
    // TODO: Implement findById method
}`,
            confidence: 0.85,
            context: {
                pattern,
                description: `Implement findById method for ${pattern.name} class`,
            },
        }));
}
