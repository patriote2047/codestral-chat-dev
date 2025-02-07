import { generateFunctionSuggestions } from './functionSuggestions';
import { CodePattern } from '../parser/patternAnalyzer';

describe('Function Suggestions', () => {
    const mockFunctionPattern: CodePattern = {
        type: 'FunctionPattern',
        name: 'calculateTotal',
        structure: {
            params: [{ name: 'items', type: 'number[]' }],
            returnType: 'number',
            hasJSDoc: false,
            hasParameterValidation: false,
            hasErrorHandling: false,
            hasImplementation: false,
        },
        frequency: 1,
    };

    const mockExistingPattern: CodePattern = {
        type: 'FunctionPattern',
        name: 'calculateAverage',
        structure: {
            params: [{ name: 'numbers', type: 'number[]' }],
            returnType: 'number',
            hasJSDoc: true,
            hasParameterValidation: true,
            hasErrorHandling: true,
            hasImplementation: true,
        },
        frequency: 2,
    };

    describe('generateFunctionSuggestions', () => {
        it('should generate suggestions for similar functions', () => {
            const suggestions = generateFunctionSuggestions(mockFunctionPattern, [
                mockExistingPattern,
            ]);

            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions.some((s) => s.type === 'FunctionCompletion')).toBe(true);
        });

        it('should generate documentation suggestions when missing', () => {
            const suggestions = generateFunctionSuggestions(mockFunctionPattern, []);

            const docSuggestion = suggestions.find(
                (s) =>
                    s.type === 'FunctionCompletion' &&
                    s.content.includes('@param') &&
                    s.content.includes('@returns')
            );

            expect(docSuggestion).toBeDefined();
            expect(docSuggestion?.confidence).toBeGreaterThanOrEqual(0.9);
        });

        it('should generate error handling suggestions when missing', () => {
            const suggestions = generateFunctionSuggestions(mockFunctionPattern, []);

            const errorSuggestion = suggestions.find(
                (s) =>
                    s.type === 'ErrorHandling' &&
                    s.content.includes('try') &&
                    s.content.includes('catch')
            );

            expect(errorSuggestion).toBeDefined();
            expect(errorSuggestion?.confidence).toBeGreaterThanOrEqual(0.8);
        });

        it('should generate parameter validation suggestions when missing', () => {
            const suggestions = generateFunctionSuggestions(mockFunctionPattern, []);

            const validationSuggestion = suggestions.find(
                (s) => s.type === 'Validation' && s.content.includes('throw new Error')
            );

            expect(validationSuggestion).toBeDefined();
            expect(validationSuggestion?.confidence).toBeGreaterThanOrEqual(0.7);
        });

        it('should not generate suggestions for complete functions', () => {
            const completePattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processData',
                structure: {
                    params: [{ name: 'data', type: 'Record<string, unknown>' }],
                    returnType: 'void',
                    hasJSDoc: true,
                    hasParameterValidation: true,
                    hasErrorHandling: true,
                    hasImplementation: true,
                },
                frequency: 1,
            };

            const suggestions = generateFunctionSuggestions(completePattern, []);

            expect(suggestions.length).toBe(0);
        });

        it('should calculate similarity confidence correctly', () => {
            const suggestions = generateFunctionSuggestions(mockFunctionPattern, [
                mockExistingPattern,
            ]);

            const similarSuggestion = suggestions.find(
                (s) => s.type === 'FunctionCompletion' && s.content.includes('calculateAverage')
            );

            expect(similarSuggestion).toBeDefined();
            expect(similarSuggestion?.confidence).toBeGreaterThan(0);
            expect(similarSuggestion?.confidence).toBeLessThanOrEqual(1);
        });

        it('should handle functions with different parameter counts', () => {
            const multiParamPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'calculateSum',
                structure: {
                    params: [
                        { name: 'a', type: 'number' },
                        { name: 'b', type: 'number' },
                    ],
                    returnType: 'number',
                    hasJSDoc: false,
                    hasParameterValidation: false,
                    hasErrorHandling: false,
                    hasImplementation: false,
                },
                frequency: 1,
            };

            const suggestions = generateFunctionSuggestions(multiParamPattern, [
                mockExistingPattern,
            ]);

            expect(suggestions.some((s) => s.type === 'Validation')).toBe(true);
            suggestions
                .filter((s) => s.type === 'Validation')
                .forEach((s) => {
                    expect(s.content).toContain('number');
                    expect(s.confidence).toBeGreaterThanOrEqual(0.7);
                });
        });

        it('should generate appropriate validation for different types', () => {
            const mixedTypesPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processUser',
                structure: {
                    params: [
                        { name: 'name', type: 'string' },
                        { name: 'age', type: 'number' },
                        { name: 'isActive', type: 'boolean' },
                    ],
                    returnType: 'void',
                    hasJSDoc: false,
                    hasParameterValidation: false,
                    hasErrorHandling: false,
                    hasImplementation: false,
                },
                frequency: 1,
            };

            const suggestions = generateFunctionSuggestions(mixedTypesPattern, []);

            const validations = suggestions.filter((s) => s.type === 'Validation');

            expect(validations).toHaveLength(3);
            expect(validations.some((v) => v.content.includes('string'))).toBe(true);
            expect(validations.some((v) => v.content.includes('number'))).toBe(true);
            expect(validations.some((v) => v.content.includes('boolean'))).toBe(true);
        });
    });
});
