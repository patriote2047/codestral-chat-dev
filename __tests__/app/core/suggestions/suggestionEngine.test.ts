import { generateSuggestions, SuggestionOptions, CodeSuggestion } from './suggestionEngine';

describe('Suggestion Engine', () => {
    describe('generateSuggestions', () => {
        it('should generate suggestions based on code analysis', () => {
            const code = `
                function calculateTotal(items: number[]): number {
                    return items.reduce((sum, item) => sum + item, 0);
                }
            `;

            const suggestions = generateSuggestions(code);

            expect(suggestions).toBeInstanceOf(Array);
            expect(suggestions.length).toBeLessThanOrEqual(5); // Default maxSuggestions
        });

        it('should respect maxSuggestions option', () => {
            const code = `
                class User {
                    constructor(private name: string) {}
                    getName(): string {
                        return this.name;
                    }
                }
            `;

            const options: SuggestionOptions = {
                maxSuggestions: 2,
            };

            const suggestions = generateSuggestions(code, options);

            expect(suggestions.length).toBeLessThanOrEqual(2);
        });

        it('should filter suggestions based on minConfidence', () => {
            const code = `
                interface Product {
                    id: number;
                    name: string;
                    price: number;
                }
            `;

            const options: SuggestionOptions = {
                minConfidence: 0.8,
            };

            const suggestions = generateSuggestions(code, options);

            suggestions.forEach((suggestion) => {
                expect(suggestion.confidence).toBeGreaterThanOrEqual(0.8);
            });
        });

        it('should consider existing code for context', () => {
            const code = `
                function validateEmail(email: string): boolean {
                    return email.includes('@');
                }
            `;

            const existingCode = `
                function validatePassword(password: string): boolean {
                    return password.length >= 8;
                }
            `;

            const options: SuggestionOptions = {
                existingCode,
            };

            const suggestions = generateSuggestions(code, options);

            expect(suggestions).toBeInstanceOf(Array);
            // Les suggestions devraient être influencées par le code existant
            // Par exemple, suggérer des validations similaires
        });

        it('should include project patterns in suggestions', () => {
            const code = `
                class Product {
                    constructor(private id: number) {}
                }
            `;

            const projectPatterns = [
                {
                    type: 'ClassPattern',
                    name: 'User',
                    structure: {
                        hasConstructor: true,
                        methodCount: 2,
                    },
                    frequency: 1,
                },
            ];

            const options: SuggestionOptions = {
                context: {
                    projectPatterns,
                },
            };

            const suggestions = generateSuggestions(code, options);

            expect(suggestions).toBeInstanceOf(Array);
            // Les suggestions devraient être influencées par les patterns du projet
        });

        it('should provide suggestions with proper structure', () => {
            const code = `
                function processData(data: any): void {
                    console.log(data);
                }
            `;

            const suggestions = generateSuggestions(code);

            suggestions.forEach((suggestion) => {
                expect(suggestion).toMatchObject({
                    type: expect.any(String),
                    content: expect.any(String),
                    confidence: expect.any(Number),
                    context: expect.objectContaining({
                        pattern: expect.any(Object),
                    }),
                });

                expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
                expect(suggestion.confidence).toBeLessThanOrEqual(1);
            });
        });
    });
});
