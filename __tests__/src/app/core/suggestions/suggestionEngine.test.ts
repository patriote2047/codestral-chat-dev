import { generateSuggestions, SuggestionOptions } from '../suggestionEngine';

describe('Suggestion Engine', () => {
    describe('Basic Suggestions', () => {
        it('should suggest function completion', () => {
            const code = `
                function calculatePrice(items: number[]): number {
                    const total = items.reduce((sum, item) => sum + item, 0);
                    return total;
                }
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'FunctionCompletion',
                    content: expect.stringContaining('calculatePrice'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'FunctionPattern',
                        }),
                    }),
                })
            );
        });

        it('should suggest variable naming patterns', () => {
            const code = `
                const itemCount: number = 0;
                const userList: string[] = [];
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'VariableNaming',
                    content: expect.stringContaining('Count'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'VariablePattern',
                        }),
                    }),
                })
            );
        });
    });

    describe('Complex Suggestions', () => {
        it('should suggest error handling patterns', () => {
            const code = `
                async function fetchUser(id: string): Promise<User> {
                    const response = await fetch(\`/api/users/\${id}\`);
                    const data = await response.json();
                    return data;
                }
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'ErrorHandling',
                    content: expect.stringContaining('try'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'APIPattern',
                        }),
                    }),
                })
            );
        });

        it('should suggest validation patterns', () => {
            const code = `
                interface User {
                    id: string;
                    name: string;
                    email: string;
                }

                function createUser(user: User): void {
                    saveUser(user);
                }
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'Validation',
                    content: expect.stringContaining('if (!user.'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'ValidationPattern',
                        }),
                    }),
                })
            );
        });
    });

    describe('Context-Aware Suggestions', () => {
        it('should suggest based on project patterns', () => {
            const existingCode = `
                class User {
                    constructor(private id: string) {}
                    
                    async save(): Promise<void> {
                        // Implementation
                    }
                }
            `;

            const newCode = `
                class Product {
                    constructor(private id: string) {}
                }
            `;

            const suggestions = generateSuggestions(newCode, { existingCode });

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'MethodImplementation',
                    content: expect.stringContaining('findById'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'ClassPattern',
                        }),
                    }),
                })
            );
        });

        it('should suggest interface implementations', () => {
            const code = `
                interface Repository<T> {
                    findAll(): Promise<T[]>;
                    findById(id: string): Promise<T | null>;
                }

                class UserRepository implements Repository<User> {
                }
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    type: 'InterfaceImplementation',
                    content: expect.stringContaining('findAll'),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.objectContaining({
                            type: 'InterfacePattern',
                        }),
                    }),
                })
            );
        });
    });

    describe('Quality and Relevance', () => {
        it('should prioritize suggestions by confidence', () => {
            const code = `
                function processUser(user: User): void {
                    saveUser(user);
                }
            `;

            const suggestions = generateSuggestions(code);

            // Vérifie que les suggestions sont triées par confiance
            const confidences = suggestions.map((s) => s.confidence);
            for (let i = 1; i < confidences.length; i++) {
                expect(confidences[i - 1]).toBeGreaterThanOrEqual(confidences[i]);
            }

            // Vérifie que la suggestion la plus pertinente est une validation
            expect(suggestions[0]).toEqual(
                expect.objectContaining({
                    type: 'Validation',
                    confidence: expect.any(Number),
                })
            );
        });
    });
});
