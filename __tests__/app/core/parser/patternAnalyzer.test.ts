import { analyzePatterns, CodePattern, PatternMatch } from '../patternAnalyzer';
import { parseCode } from '../astParser';

describe('Pattern Analyzer', () => {
    describe('Basic Pattern Detection', () => {
        it('should detect simple function patterns', () => {
            const code = `
                function add(a: number, b: number): number {
                    return a + b;
                }
                
                function subtract(x: number, y: number): number {
                    return x - y;
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'FunctionPattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        returnType: 'number',
                        parameterCount: 2,
                    }),
                })
            );
        });

        it('should detect variable declaration patterns', () => {
            const code = `
                const x = 42;
                let y = "hello";
                const z = true;
                let w = 123;
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'VariablePattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        kind: 'const',
                    }),
                })
            );

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'VariablePattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        kind: 'let',
                    }),
                })
            );
        });
    });

    describe('Complex Pattern Detection', () => {
        it('should detect class patterns', () => {
            const code = `
                class User {
                    constructor(public name: string) {}
                    getName(): string {
                        return this.name;
                    }
                }
                
                class Product {
                    constructor(public title: string) {}
                    getTitle(): string {
                        return this.title;
                    }
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'ClassPattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        hasConstructor: true,
                        methodCount: 2,
                    }),
                })
            );
        });

        it('should detect API patterns', () => {
            const code = `
                async function fetchUser(id: string) {
                    const response = await fetch('/api/users/' + id);
                    return response.json();
                }
                
                async function fetchProduct(id: string) {
                    const response = await fetch('/api/products/' + id);
                    return response.json();
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'APIPattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        isAsync: true,
                        hasFetch: true,
                    }),
                })
            );
        });
    });

    describe('Pattern Matching', () => {
        it('should find similar code blocks', () => {
            const code = `
                function validateUser(user) {
                    if (!user.name) throw new Error('Name required');
                    if (!user.email) throw new Error('Email required');
                    return true;
                }
                
                function validateProduct(product) {
                    if (!product.title) throw new Error('Title required');
                    if (!product.price) throw new Error('Price required');
                    return true;
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'ValidationPattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        checksCount: 2,
                        throwsError: true,
                    }),
                })
            );
        });

        it('should detect error handling patterns', () => {
            const code = `
                function process1() {
                    try {
                        doSomething();
                    } catch (error) {
                        console.error('Error:', error);
                        throw error;
                    }
                }
                
                function process2() {
                    try {
                        doSomethingElse();
                    } catch (error) {
                        console.error('Error:', error);
                        throw error;
                    }
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'ErrorHandlingPattern',
                    frequency: 2,
                    structure: expect.objectContaining({
                        hasTryCatch: true,
                        hasErrorLogging: true,
                        rethrowsError: true,
                    }),
                })
            );
        });
    });

    describe('Pattern Statistics', () => {
        it('should calculate pattern frequencies', () => {
            const code = `
                const x = 1;
                const y = 2;
                let z = 3;
                
                function f1() { return true; }
                function f2() { return false; }
                function f3() { return true; }
            `;

            const patterns = analyzePatterns(parseCode(code));

            const constPattern = patterns.find(
                (p) => p.type === 'VariablePattern' && p.structure.kind === 'const'
            );

            const functionPattern = patterns.find((p) => p.type === 'FunctionPattern');

            expect(constPattern?.frequency).toBe(2);
            expect(functionPattern?.frequency).toBe(3);
        });

        it('should identify common patterns', () => {
            const code = `
                interface User {
                    id: string;
                    name: string;
                }
                
                interface Product {
                    id: string;
                    title: string;
                }
                
                interface Order {
                    id: string;
                    items: string[];
                }
            `;

            const patterns = analyzePatterns(parseCode(code));

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'InterfacePattern',
                    frequency: 3,
                    structure: expect.objectContaining({
                        hasIdField: true,
                        fieldCount: expect.any(Number),
                    }),
                })
            );
        });
    });
});
