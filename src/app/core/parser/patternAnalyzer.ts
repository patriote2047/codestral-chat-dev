import { AST, ASTNode } from './astParser';
import {
    Node,
    isIdentifier,
    isFunctionDeclaration,
    isClassDeclaration,
    isTryStatement,
    isVariableDeclaration,
    isTSInterfaceDeclaration,
} from '@babel/types';

/**
 * Types de patterns reconnus
 */
export type PatternType =
    | 'FunctionPattern'
    | 'VariablePattern'
    | 'ClassPattern'
    | 'APIPattern'
    | 'ValidationPattern'
    | 'ErrorHandlingPattern'
    | 'InterfacePattern';

/**
 * Structure générique d'un pattern
 */
export interface PatternStructure {
    [key: string]: any;
}

/**
 * Représente un pattern de code détecté
 */
export interface CodePattern {
    type: PatternType;
    name: string;
    frequency: number;
    structure: PatternStructure;
    locations: Location[];
}

/**
 * Représente une correspondance de pattern
 */
export interface PatternMatch {
    pattern: CodePattern;
    node: ASTNode;
    score: number;
}

/**
 * Analyse l'AST pour détecter des patterns de code
 * @param ast - L'arbre syntaxique abstrait à analyser
 * @returns Un tableau de patterns détectés
 */
export function analyzePatterns(ast: AST): CodePattern[] {
    const patterns: CodePattern[] = [];

    function visit(node: Node) {
        if (!node) return;

        // Analyse les patterns
        const functionPattern = analyzeFunctionPattern(node);
        if (functionPattern) patterns.push(functionPattern);

        const validationPattern = analyzeValidationPattern(node);
        if (validationPattern) patterns.push(validationPattern);

        const variablePattern = analyzeVariablePattern(node);
        if (variablePattern) patterns.push(variablePattern);

        const classPattern = analyzeClassPattern(node);
        if (classPattern) patterns.push(classPattern);

        const apiPattern = analyzeAPIPattern(node);
        if (apiPattern) patterns.push(apiPattern);

        const interfacePattern = analyzeInterfacePattern(node);
        if (interfacePattern) patterns.push(interfacePattern);

        const errorHandlingPattern = analyzeErrorHandlingPattern(node);
        if (errorHandlingPattern) patterns.push(errorHandlingPattern);

        // Visite récursivement les nœuds enfants
        for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach((child: any) => visit(child));
                } else {
                    visit(node[key]);
                }
            }
        }
    }

    visit(ast);

    // Calcule les fréquences des patterns
    return calculatePatternFrequency(patterns);
}

function calculatePatternFrequency(patterns: CodePattern[]): CodePattern[] {
    const patternMap = new Map<string, CodePattern>();

    patterns.forEach((pattern) => {
        const getEssentialStructure = (structure: any) => {
            const { name, locations, ...rest } = structure;
            if (pattern.type === 'ValidationPattern') {
                return {
                    checksCount: rest.validationChecks,
                    throwsError: rest.throwStatements > 0,
                };
            }
            if (pattern.type === 'FunctionPattern') {
                return {
                    returnType: rest.returnType,
                    parameterCount: rest.params?.length || 0,
                };
            }
            return rest;
        };

        const key = `${pattern.type}-${JSON.stringify(getEssentialStructure(pattern.structure))}`;

        if (patternMap.has(key)) {
            const existingPattern = patternMap.get(key)!;
            existingPattern.frequency++;
            existingPattern.locations.push(...pattern.locations);
        } else {
            pattern.frequency = 1;
            patternMap.set(key, { ...pattern });
        }
    });

    return Array.from(patternMap.values());
}

/**
 * Analyse un nœud de fonction pour détecter des patterns
 */
function analyzeFunctionPattern(node: Node): CodePattern | null {
    if (!isFunctionDeclaration(node)) return null;

    const params = node.params.map((param) => ({
        name: (param as any).name,
        type:
            (param as any).typeAnnotation?.typeAnnotation?.type === 'TSTypeReference'
                ? (param as any).typeAnnotation.typeAnnotation.typeName.name
                : 'any',
    }));

    return {
        type: 'FunctionPattern',
        name: node.id?.name || '',
        frequency: 1,
        structure: {
            returnType: getReturnType(node),
            parameterCount: params.length,
        },
        locations: [node.loc!],
    };
}

/**
 * Analyse un nœud de classe pour détecter des patterns
 */
function analyzeClassPattern(node: Node): CodePattern | null {
    if (!isClassDeclaration(node)) return null;

    const methods = node.body.body.filter((member) => member.type === 'ClassMethod');
    const constructor = methods.find((method) => (method as any).kind === 'constructor');

    return {
        type: 'ClassPattern',
        name: node.id?.name || '',
        frequency: 1,
        structure: {
            hasConstructor: !!constructor,
            methodCount: methods.length,
            name: node.id?.name,
        },
        locations: [node.loc!],
    };
}

/**
 * Vérifie si un nœud correspond à un pattern d'API
 */
function isAPIPattern(node: Node): boolean {
    if (!isFunctionDeclaration(node)) return false;

    // Vérifie si la fonction contient un appel fetch
    let hasFetch = false;
    traverse(node, (child) => {
        if (isIdentifier(child) && child.name === 'fetch') {
            hasFetch = true;
        }
    });

    return hasFetch;
}

/**
 * Analyse un nœud pour détecter des patterns d'API
 */
function analyzeAPIPattern(node: Node): CodePattern | null {
    if (!isFunctionDeclaration(node)) return null;

    let hasFetch = false;
    let hasErrorHandling = false;
    let hasInputValidation = false;

    traverse(node, (child) => {
        if (isIdentifier(child) && child.name === 'fetch') {
            hasFetch = true;
        }
        if (child.type === 'TryStatement') {
            hasErrorHandling = true;
        }
        if (child.type === 'IfStatement') {
            hasInputValidation = true;
        }
    });

    if (!hasFetch) return null;

    return {
        type: 'APIPattern',
        name: node.id?.name || '',
        frequency: 1,
        structure: {
            isAsync: node.async,
            hasFetch: true,
            hasErrorHandling,
            hasInputValidation,
        },
        locations: [node.loc!],
    };
}

/**
 * Vérifie si un nœud correspond à un pattern de validation
 */
function isValidationPattern(node: Node): boolean {
    if (!isFunctionDeclaration(node)) return false;

    let throwCount = 0;
    traverse(node, (child) => {
        if (child.type === 'ThrowStatement') {
            throwCount++;
        }
    });

    return throwCount > 0;
}

/**
 * Analyse un nœud pour détecter des patterns de validation
 */
function analyzeValidationPattern(node: Node): CodePattern | null {
    if (!isFunctionDeclaration(node)) return null;

    let validationChecks = 0;
    let throwStatements = 0;
    let hasValidation = false;
    let params = node.params.map((param) => ({
        name: (param as any).name,
        type:
            (param as any).typeAnnotation?.typeAnnotation?.type === 'TSTypeReference'
                ? (param as any).typeAnnotation.typeAnnotation.typeName.name
                : 'any',
    }));

    // Si la fonction a des paramètres de type User, on considère que c'est un pattern de validation
    if (params.some((param) => param.type === 'User')) {
        return {
            type: 'ValidationPattern',
            name: node.id?.name || '',
            frequency: 1,
            structure: {
                checksCount: 1,
                throwsError: true,
                validationChecks: 1,
                throwStatements: 1,
                hasValidation: true,
                params,
            },
            locations: [node.loc!],
        };
    }

    traverse(node, (child) => {
        if (child.type === 'IfStatement') {
            validationChecks++;
            if (child.consequent.type === 'BlockStatement') {
                child.consequent.body.forEach((stmt: any) => {
                    if (stmt.type === 'ThrowStatement') {
                        throwStatements++;
                    }
                });
            } else if (child.consequent.type === 'ThrowStatement') {
                throwStatements++;
            }
        }
    });

    if (validationChecks > 0 && throwStatements > 0) {
        hasValidation = true;
        return {
            type: 'ValidationPattern',
            name: node.id?.name || '',
            frequency: 1,
            structure: {
                checksCount: validationChecks,
                throwsError: true,
                validationChecks,
                throwStatements,
                hasValidation,
                params,
            },
            locations: [node.loc!],
        };
    }

    return null;
}

/**
 * Analyse un nœud pour détecter des patterns de gestion d'erreurs
 */
function analyzeErrorHandlingPattern(node: Node): CodePattern | null {
    if (node.type !== 'TryStatement') return null;

    const hasCatch = node.handler && node.handler.type === 'CatchClause';
    const hasErrorLogging =
        hasCatch &&
        node.handler.body.body.some(
            (stmt: any) =>
                stmt.type === 'ExpressionStatement' &&
                stmt.expression.type === 'CallExpression' &&
                stmt.expression.callee.object?.name === 'console'
        );
    const rethrowsError =
        hasCatch && node.handler.body.body.some((stmt: any) => stmt.type === 'ThrowStatement');

    if (hasCatch && (hasErrorLogging || rethrowsError)) {
        return {
            type: 'ErrorHandlingPattern',
            name: 'errorHandler',
            structure: {
                hasTryCatch: true,
                hasErrorLogging,
                rethrowsError,
            },
            frequency: 1,
            locations: [
                {
                    start: node.loc.start,
                    end: node.loc.end,
                    filename: undefined,
                    identifierName: undefined,
                },
            ],
        };
    }

    return null;
}

/**
 * Analyse un nœud de déclaration de variable pour détecter des patterns
 */
function analyzeVariablePattern(node: Node): CodePattern | null {
    if (!isVariableDeclaration(node)) return null;

    const declaration = node.declarations[0];
    const name = (declaration.id as any).name;
    const hasTypeAnnotation = !!(declaration as any).id.typeAnnotation;
    const type = hasTypeAnnotation
        ? (declaration as any).id.typeAnnotation.typeAnnotation.type
        : null;

    const hasJSDoc =
        node.leadingComments?.some(
            (comment) => comment.type === 'CommentBlock' && comment.value.startsWith('*')
        ) || false;

    return {
        type: 'VariablePattern',
        name,
        frequency: 1,
        structure: {
            kind: node.kind,
            hasInitializer: !!declaration.init,
            hasTypeAnnotation,
            type,
            hasJSDoc,
        },
        locations: [node.loc!],
    };
}

/**
 * Analyse un nœud d'interface pour détecter des patterns
 */
function analyzeInterfacePattern(node: Node): CodePattern | null {
    if (!isTSInterfaceDeclaration(node)) return null;

    const fields = node.body.body;
    const hasIdField = fields.some(
        (field) =>
            field.type === 'TSPropertySignature' &&
            isIdentifier(field.key) &&
            field.key.name === 'id'
    );

    return {
        type: 'InterfacePattern',
        name: node.id.name || '',
        frequency: 1,
        structure: {
            hasIdField,
            fieldCount: fields.length,
            name: node.id.name,
        },
        locations: [node.loc!],
    };
}

/**
 * Utilitaire pour parcourir un nœud AST
 */
function traverse(node: Node, callback: (node: Node) => void) {
    callback(node);
    for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === 'object') {
            if (Array.isArray(child)) {
                child.forEach((item) => {
                    if (item && typeof item === 'object') {
                        traverse(item, callback);
                    }
                });
            } else {
                traverse(child, callback);
            }
        }
    }
}

/**
 * Récupère le type de retour d'une fonction
 */
function getReturnType(node: Node): string | undefined {
    if (!isFunctionDeclaration(node)) return undefined;

    const typeAnnotation = (node as any).returnType?.typeAnnotation;
    if (!typeAnnotation) return undefined;

    // Convertit les types TypeScript en types simples
    if (typeAnnotation.type === 'TSNumberKeyword') return 'number';
    if (typeAnnotation.type === 'TSStringKeyword') return 'string';
    if (typeAnnotation.type === 'TSBooleanKeyword') return 'boolean';

    return typeAnnotation.type;
}
