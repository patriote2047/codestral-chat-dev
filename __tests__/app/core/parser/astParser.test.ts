import { parseCode, ASTNode, ParserOptions, AST } from '../astParser';

describe('Core Parser - AST Parser', () => {
    describe('Basic Parsing', () => {
        it('should parse a simple variable declaration', () => {
            const code = 'const x = 42;';
            const ast = parseCode(code);

            expect(ast).toBeDefined();
            expect(ast.type).toBe('Program');
            expect(ast.body[0].type).toBe('VariableDeclaration');
        });

        it('should parse a function declaration', () => {
            const code = 'function test() { return true; }';
            const ast = parseCode(code);

            expect(ast).toBeDefined();
            expect(ast.body[0].type).toBe('FunctionDeclaration');
        });

        it('should parse complex expressions', () => {
            const code = `
                const sum = (a, b) => a + b;
                class Calculator {
                    add(x, y) { return x + y; }
                }
            `;
            const ast = parseCode(code);

            expect(ast.body).toHaveLength(2);
            expect(ast.body[0].type).toBe('VariableDeclaration');
            expect(ast.body[1].type).toBe('ClassDeclaration');
        });
    });

    describe('Language Support', () => {
        it('should detect and parse JavaScript code', () => {
            const code = 'console.log("Hello");';
            const options: ParserOptions = { language: 'javascript' };
            const ast = parseCode(code, options);

            expect(ast).toBeDefined();
            expect(ast.language).toBe('javascript');
        });

        it('should detect and parse TypeScript code', () => {
            const code = 'const x: number = 42;';
            const options: ParserOptions = { language: 'typescript' };
            const ast = parseCode(code, options);

            expect(ast).toBeDefined();
            expect(ast.language).toBe('typescript');
        });

        it('should auto-detect TypeScript by type annotations', () => {
            const code = 'function add(a: number, b: number): number { return a + b; }';
            const ast = parseCode(code);

            expect(ast.language).toBe('typescript');
        });

        it('should handle TypeScript interfaces', () => {
            const code = `
                interface User {
                    id: number;
                    name: string;
                }
            `;
            const ast = parseCode(code);

            expect(ast.body[0].type).toBe('TSInterfaceDeclaration');
        });
    });

    describe('Error Handling', () => {
        it('should throw on invalid syntax', () => {
            const invalidCode = 'const x =;';
            expect(() => parseCode(invalidCode)).toThrow();
        });

        it('should handle empty input', () => {
            const ast = parseCode('');
            expect(ast).toBeDefined();
            expect(ast.body).toHaveLength(0);
        });

        it('should throw on unclosed brackets', () => {
            const invalidCode = 'function test() { return true;';
            expect(() => parseCode(invalidCode)).toThrow();
        });

        it('should throw on invalid TypeScript syntax', () => {
            const invalidCode = `
                interface {  // Manque le nom de l'interface
                    field: string;
                }
            `;
            expect(() => parseCode(invalidCode)).toThrow();
        });
    });

    describe('AST Structure', () => {
        it('should generate correct node types', () => {
            const code = `
                const x = 42;
                function test() {
                    return x + 1;
                }
            `;
            const ast = parseCode(code);

            expect(ast.body).toHaveLength(2);
            expect(ast.body[0].type).toBe('VariableDeclaration');
            expect(ast.body[1].type).toBe('FunctionDeclaration');
        });

        it('should include location information', () => {
            const code = 'const x = 42;';
            const ast = parseCode(code);

            expect(ast.body[0].loc).toBeDefined();
            expect(ast.body[0].loc.start.line).toBe(1);
            expect(ast.body[0].loc.start.column).toBeDefined();
        });

        it('should handle multi-line code correctly', () => {
            const code = `
                function test() {
                    const x = 1;
                    const y = 2;
                    return x + y;
                }
            `;
            const ast = parseCode(code);

            const func = ast.body[0];
            expect(func.loc.start.line).toBe(2); // Compte la ligne vide
            expect(func.type).toBe('FunctionDeclaration');
        });
    });

    describe('Module Support', () => {
        it('should parse ES6 imports', () => {
            const code = `
                import { useState } from 'react';
                import type { User } from './types';
            `;
            const ast = parseCode(code);

            expect(ast.body[0].type).toBe('ImportDeclaration');
            expect(ast.body[1].type).toBe('ImportDeclaration');
        });

        it('should parse ES6 exports', () => {
            const code = `
                export const x = 42;
                export default class App {}
            `;
            const ast = parseCode(code);

            expect(ast.body[0].type).toBe('ExportNamedDeclaration');
            expect(ast.body[1].type).toBe('ExportDefaultDeclaration');
        });
    });
});
