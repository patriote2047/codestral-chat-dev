/**
 * Core Parser Module
 * Module central pour l'analyse syntaxique du code dans Codyman
 */

export { parseCode } from './astParser';
export type { ASTNode, AST, ParserOptions, Location } from './astParser';

// Re-export des types utiles de @babel/types pour les consommateurs
export type {
    File,
    Statement,
    Expression,
    Identifier,
    FunctionDeclaration,
    VariableDeclaration,
} from '@babel/types';
