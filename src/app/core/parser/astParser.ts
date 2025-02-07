import * as parser from '@babel/parser';
import { File } from '@babel/types';

/**
 * Interface représentant la position dans le code source
 */
export interface Location {
    start: {
        line: number; // Numéro de ligne (1-based)
        column: number; // Position dans la ligne (0-based)
    };
    end: {
        line: number;
        column: number;
    };
}

/**
 * Interface de base pour tous les nœuds de l'AST
 */
export interface ASTNode {
    type: string; // Type du nœud (ex: 'FunctionDeclaration', 'VariableDeclaration', etc.)
    loc: Location; // Position dans le code source
    [key: string]: any; // Propriétés additionnelles spécifiques au type de nœud
}

/**
 * Options de configuration du parser
 */
export interface ParserOptions {
    /** Langage du code source */
    language?: 'javascript' | 'typescript';
    /** Type de module ('module' pour ESM, 'script' pour script classique) */
    sourceType?: 'module' | 'script';
    /** Plugins Babel à activer */
    plugins?: string[];
}

/**
 * Interface représentant l'AST complet
 */
export interface AST extends ASTNode {
    type: 'Program'; // Le nœud racine est toujours de type 'Program'
    body: ASTNode[]; // Liste des déclarations/instructions
    language?: string; // Langage détecté/utilisé
}

/**
 * Parse le code source en AST (Abstract Syntax Tree)
 *
 * Cette fonction est le point d'entrée principal du parser. Elle analyse le code source
 * et génère un arbre syntaxique abstrait (AST) qui peut être utilisé pour :
 * - L'analyse statique du code
 * - La génération de suggestions
 * - La détection d'erreurs
 * - L'analyse des patterns de code
 *
 * @example
 * ```typescript
 * // Exemple d'utilisation basique
 * const code = 'function add(a: number, b: number) { return a + b; }';
 * const ast = parseCode(code);
 *
 * // Exemple avec options
 * const ast = parseCode(code, {
 *   language: 'typescript',
 *   sourceType: 'module'
 * });
 * ```
 *
 * @param code - Le code source à parser
 * @param options - Options de configuration du parser
 * @returns AST - L'arbre syntaxique abstrait généré
 * @throws {Error} Si le code source contient des erreurs de syntaxe
 */
export function parseCode(code: string, options: ParserOptions = {}): AST {
    try {
        // Configuration par défaut du parser
        const defaultOptions = {
            sourceType: 'module',
            plugins: ['typescript'],
            ...options,
            // Force l'activation du plugin typescript pour la validation des types
            plugins: [...(options.plugins || []), 'typescript'],
        };

        // Détection automatique du langage si non spécifié
        if (!options.language) {
            options.language = code.includes(':') ? 'typescript' : 'javascript';
        }

        // Parse le code avec Babel
        const ast = parser.parse(code, {
            ...defaultOptions,
            errorRecovery: false, // Désactive la récupération d'erreur pour lever les erreurs de syntaxe
            strictMode: true, // Active le mode strict pour une meilleure détection des erreurs
        }) as unknown as File;

        // Transforme l'AST Babel en notre format standardisé
        return {
            type: 'Program',
            body: ast.program.body,
            language: options.language,
            loc: ast.program.loc!,
        };
    } catch (error) {
        // Gestion des erreurs avec messages clairs
        if (error instanceof Error) {
            throw new Error(`Parser error: ${error.message}`);
        }
        throw error;
    }
}
