import { CodePattern } from '../parser/patternAnalyzer';
import { CodeSuggestion } from './suggestionEngine';

/**
 * Génère des suggestions de validation basées sur les patterns existants
 */
export function generateValidationSuggestions(
    patterns: CodePattern[],
    existingPatterns: CodePattern[] = []
): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Analyse les patterns de fonction pour la validation des paramètres
    const functionPatterns = patterns.filter((p) => p.type === 'FunctionPattern');
    functionPatterns.forEach((pattern) => {
        // Si la fonction est déjà entièrement validée, on ne génère pas de suggestions
        if (
            pattern.structure.hasParameterValidation &&
            pattern.structure.hasReturnTypeValidation &&
            pattern.structure.hasAssertions
        ) {
            return;
        }

        if (!pattern.structure.hasParameterValidation) {
            const paramValidations = generateParameterValidationSuggestions(pattern);
            suggestions.push(...paramValidations);
        }

        if (!pattern.structure.hasReturnTypeValidation) {
            const returnValidation = generateReturnTypeValidationSuggestions(pattern);
            if (returnValidation.length > 0) {
                suggestions.push(...returnValidation);
            }
        }

        if (!pattern.structure.hasAssertions) {
            const assertions = generateAssertionSuggestions(pattern);
            if (assertions.length > 0) {
                suggestions.push(...assertions);
            }
        }

        // On ne génère des schémas de validation que si la fonction n'est pas déjà validée
        if (!pattern.structure.hasParameterValidation && shouldHaveValidationSchema(pattern)) {
            const schemas = generateValidationSchemaSuggestions(pattern);
            suggestions.push(...schemas);
        }
    });

    // Analyse les patterns d'interface pour la validation des champs
    const interfacePatterns = patterns.filter((p) => p.type === 'InterfacePattern');
    interfacePatterns.forEach((pattern) => {
        if (pattern.structure.fields) {
            const interfaceValidations = generateInterfaceValidationSuggestions(pattern);
            suggestions.push(...interfaceValidations);
        }
    });

    return suggestions;
}

/**
 * Génère des suggestions de validation pour les paramètres d'une fonction
 */
function generateParameterValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const params = pattern.structure.params || [];
    if (!params.length) return [];

    return params.map((param) => ({
        type: 'Validation',
        content: generateValidationForType(param.name, param.type),
        confidence: 0.9,
        context: {
            pattern,
            description: `Ajouter la validation pour le paramètre ${param.name}`,
        },
    }));
}

/**
 * Génère des suggestions de validation pour les champs d'une interface
 */
function generateInterfaceValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const fields = pattern.structure.fields || [];
    if (!fields.length) return [];

    return fields.map((field) => ({
        type: 'Validation',
        content: `if (!${pattern.name.toLowerCase()}.${field.name}) { throw new TypeError('${field.name} is required'); }`,
        confidence: 0.85,
        context: {
            pattern,
            description: `Ajouter la validation pour le champ ${field.name}`,
        },
    }));
}

/**
 * Génère des suggestions de validation pour le type de retour
 */
function generateReturnTypeValidationSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const returnType = pattern.structure.returnType;
    if (!returnType || returnType === 'void') return [];

    return [
        {
            type: 'Validation',
            content: generateReturnTypeValidation(returnType),
            confidence: 0.8,
            context: {
                pattern,
                description: 'Ajouter la validation du type de retour',
            },
        },
    ];
}

/**
 * Génère des suggestions d'assertions
 */
function generateAssertionSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const params = pattern.structure.params || [];
    if (!params.length) return [];

    const assertions = params.map((param) => generateAssertionForParameter(param)).join('\n');
    if (!assertions) return [];

    return [
        {
            type: 'Validation',
            content: assertions,
            confidence: 0.7,
            context: {
                pattern,
                description: 'Ajouter des assertions pour les paramètres',
            },
        },
    ];
}

/**
 * Génère des suggestions de schémas de validation
 */
function generateValidationSchemaSuggestions(pattern: CodePattern): CodeSuggestion[] {
    const params = pattern.structure.params || [];
    if (!params.length) return [];

    const zodSchema = {
        type: 'Validation',
        content: generateZodSchema(pattern.name, params),
        confidence: 0.85,
        context: {
            pattern,
            description: 'Ajouter un schéma de validation Zod',
        },
    };

    const yupSchema = {
        type: 'Validation',
        content: generateYupSchema(pattern.name, params),
        confidence: 0.85,
        context: {
            pattern,
            description: 'Ajouter un schéma de validation Yup',
        },
    };

    return [zodSchema, yupSchema];
}

/**
 * Génère du code de validation pour un paramètre
 */
function generateValidationForParameter(param: any): string {
    const { name, type } = param;
    const lowerType = type.toLowerCase();

    // Validation de base pour null/undefined
    const baseValidation = `if (${name} === undefined || ${name} === null) { throw new TypeError('${name} is required'); }\n`;

    let typeValidation = '';
    switch (lowerType) {
        case 'string':
            typeValidation = `if (typeof ${name} !== 'string') { throw new TypeError('${name} must be a string'); }`;
            break;
        case 'number':
            typeValidation = `if (typeof ${name} !== 'number') { throw new TypeError('${name} must be a number'); }`;
            break;
        case 'boolean':
            typeValidation = `if (typeof ${name} !== 'boolean') { throw new TypeError('${name} must be a boolean'); }`;
            break;
        case 'object':
        case 'user': // Ajout spécifique pour le type User
            typeValidation = `if (!${name} || typeof ${name} !== 'object' || Array.isArray(${name})) { throw new TypeError('${name} must be an object'); }
if (!${name}.id) { throw new Error('${name}.id is required'); }
if (!${name}.name) { throw new Error('${name}.name is required'); }`;
            break;
        case 'array':
        case 'array<any>':
            typeValidation = `if (!Array.isArray(${name})) { throw new TypeError('${name} must be an Array'); }`;
            break;
        default:
            if (type.endsWith('[]') || type.startsWith('Array<')) {
                const baseType = type.endsWith('[]')
                    ? type.slice(0, -2)
                    : type.match(/Array<(.+)>/)?.[1] || 'any';
                typeValidation = `if (!Array.isArray(${name})) { throw new TypeError('${name} must be an Array'); }
if (${name}.length > 0) {
    ${name}.forEach((item, index) => {
        if (!(typeof item === '${baseType.toLowerCase()}' || item instanceof ${baseType})) {
            throw new TypeError(\`${name}[\${index}] must be a ${baseType}\`);
        }
    });
}`;
            } else if (type.includes('|')) {
                const types = type.split('|').map((t) => t.trim());
                const conditions = types
                    .map(
                        (t) =>
                            `(typeof ${name} === '${t.toLowerCase()}' || ${name} instanceof ${t})`
                    )
                    .join(' || ');
                typeValidation = `if (!(${conditions})) { throw new TypeError('${name} must be one of: ${types.join(', ')}'); }`;
            } else {
                typeValidation = `if (!${name} || !(${name} instanceof ${type})) { throw new TypeError('${name} must be a ${type}'); }`;
            }
    }

    return baseValidation + typeValidation;
}

/**
 * Génère du code de validation pour un type de retour
 */
function generateReturnTypeValidation(type: string): string {
    return `function validateReturnType(result: any): ${type} {
    if (result === undefined || result === null) { throw new TypeError('Return value is required'); }
    ${generateTypeCheck('result', type)}
    return result;
}`;
}

/**
 * Génère une vérification de type
 */
function generateTypeCheck(varName: string, type: string): string {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
        case 'string':
            return `if (typeof ${varName} !== 'string') { throw new TypeError('Return value must be a string'); }`;
        case 'number':
            return `if (typeof ${varName} !== 'number') { throw new TypeError('Return value must be a number'); }`;
        case 'boolean':
            return `if (typeof ${varName} !== 'boolean') { throw new TypeError('Return value must be a boolean'); }`;
        case 'object':
            return `if (typeof ${varName} !== 'object') { throw new TypeError('Return value must be an object'); }`;
        default:
            if (type.endsWith('[]')) {
                return `if (!Array.isArray(${varName})) { throw new TypeError('Return value must be an array of ${type.slice(0, -2)}'); }`;
            }
            return `if (!(${varName} instanceof ${type})) { throw new TypeError('Return value must be a ${type}'); }`;
    }
}

/**
 * Génère une assertion pour un paramètre
 */
function generateAssertionForParameter(param: any): string {
    const { name, type } = param;
    const lowerType = type.toLowerCase();
    switch (lowerType) {
        case 'string':
            return `console.assert(typeof ${name} === 'string', '${name} must be a string');`;
        case 'number':
            return `console.assert(typeof ${name} === 'number', '${name} must be a number');`;
        case 'boolean':
            return `console.assert(typeof ${name} === 'boolean', '${name} must be a boolean');`;
        case 'object':
            return `console.assert(${name} && typeof ${name} === 'object', '${name} must be an object');`;
        default:
            if (type.endsWith('[]')) {
                return `console.assert(Array.isArray(${name}), '${name} must be an array of ${type.slice(0, -2)}');`;
            }
            return `console.assert(${name} !== undefined && ${name} !== null, '${name} is required');`;
    }
}

/**
 * Détermine si un pattern devrait avoir un schéma de validation
 */
function shouldHaveValidationSchema(pattern: CodePattern): boolean {
    const params = pattern.structure.params || [];

    // Si la fonction a des paramètres complexes
    if (
        params.some((param) => {
            const type = param.type.toLowerCase();
            return (
                type === 'object' ||
                type.endsWith('[]') ||
                type.startsWith('array<') ||
                type.includes('|') || // Union types
                type.includes('&') || // Intersection types
                type === 'any'
            ); // Type any
        })
    ) {
        return true;
    }

    // Si le nom suggère une validation
    const name = pattern.name.toLowerCase();
    return (
        name.includes('validate') ||
        name.includes('check') ||
        name.includes('verify') ||
        name.includes('parse') ||
        name.includes('transform')
    );
}

/**
 * Génère un schéma de validation Zod
 */
function generateZodSchema(name: string, params: any[]): string {
    const imports = `import { z } from 'zod';`;

    const paramSchemas = params
        .map((param) => {
            const { name, type } = param;
            const lowerType = type.toLowerCase();
            switch (lowerType) {
                case 'string':
                    return `${name}: z.string()`;
                case 'number':
                    return `${name}: z.number()`;
                case 'boolean':
                    return `${name}: z.boolean()`;
                case 'object':
                    return `${name}: z.object({}).passthrough()`;
                case 'date':
                    return `${name}: z.date()`;
                case 'array':
                case 'array<any>':
                    return `${name}: z.array(z.any())`;
                default:
                    if (type.endsWith('[]')) {
                        const itemType = type.slice(0, -2).toLowerCase();
                        switch (itemType) {
                            case 'string':
                                return `${name}: z.array(z.string())`;
                            case 'number':
                                return `${name}: z.array(z.number())`;
                            case 'boolean':
                                return `${name}: z.array(z.boolean())`;
                            default:
                                return `${name}: z.array(z.any())`;
                        }
                    }
                    return `${name}: z.any()`;
            }
        })
        .join(',\n    ');

    return `${imports}

const ${name}Schema = z.object({
    ${paramSchemas}
});`;
}

/**
 * Génère un schéma de validation Yup
 */
function generateYupSchema(name: string, params: any[]): string {
    const imports = `import * as yup from 'yup';`;

    const paramSchemas = params
        .map((param) => {
            const { name, type } = param;
            const lowerType = type.toLowerCase();
            switch (lowerType) {
                case 'string':
                    return `${name}: yup.string().required()`;
                case 'number':
                    return `${name}: yup.number().required()`;
                case 'boolean':
                    return `${name}: yup.boolean().required()`;
                case 'object':
                    return `${name}: yup.object().required()`;
                case 'date':
                    return `${name}: yup.date().required()`;
                case 'array':
                case 'array<any>':
                    return `${name}: yup.array().required()`;
                default:
                    if (type.endsWith('[]')) {
                        const itemType = type.slice(0, -2).toLowerCase();
                        switch (itemType) {
                            case 'string':
                                return `${name}: yup.array().of(yup.string()).required()`;
                            case 'number':
                                return `${name}: yup.array().of(yup.number()).required()`;
                            case 'boolean':
                                return `${name}: yup.array().of(yup.boolean()).required()`;
                            default:
                                return `${name}: yup.array().required()`;
                        }
                    }
                    return `${name}: yup.mixed().required()`;
            }
        })
        .join(',\n    ');

    return `${imports}

const ${name}Schema = yup.object({
    ${paramSchemas}
});`;
}

export function generateValidationForType(name: string, type: string): string {
    const lowerType = type.toLowerCase();

    // Gestion des types Array
    if (type === 'Array' || type === 'array' || lowerType === 'array' || type.includes('[]')) {
        return `if (!Array.isArray(${name})) { throw new TypeError('${name} must be an Array'); }`;
    }

    // Gestion des autres types
    if (lowerType.includes('string')) {
        return `if (typeof ${name} !== 'string') { throw new TypeError('${name} must be a string'); }`;
    }
    if (lowerType.includes('number')) {
        return `if (typeof ${name} !== 'number' || isNaN(${name})) { throw new TypeError('${name} must be a number'); }`;
    }
    if (lowerType.includes('boolean')) {
        return `if (typeof ${name} !== 'boolean') { throw new TypeError('${name} must be a boolean'); }`;
    }
    if (lowerType.includes('object')) {
        return `if (typeof ${name} !== 'object' || ${name} === null) { throw new TypeError('${name} must be an object'); }`;
    }
    return `if (!(${name} instanceof ${type})) { throw new TypeError('${name} must be a ${type}'); }`;
}
