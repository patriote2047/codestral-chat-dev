import { generateErrorHandlingSuggestions } from './errorHandlingSuggestions';
import { CodePattern } from '../parser/patternAnalyzer';

describe('Error Handling Suggestions', () => {
    const mockFunctionPattern: CodePattern = {
        type: 'FunctionPattern',
        name: 'processData',
        structure: {
            params: [{ name: 'data', type: 'any' }],
            returnType: 'void',
            hasTryCatch: false,
            hasInputValidation: false,
            hasCustomErrors: false,
            isAsync: false,
            hasAsyncErrorHandling: false,
        },
        frequency: 1,
    };

    const mockAsyncPattern: CodePattern = {
        type: 'FunctionPattern',
        name: 'fetchData',
        structure: {
            params: [{ name: 'url', type: 'string' }],
            returnType: 'Promise<any>',
            hasTryCatch: false,
            hasInputValidation: false,
            hasCustomErrors: false,
            isAsync: true,
            hasAsyncErrorHandling: false,
        },
        frequency: 1,
    };

    describe('generateErrorHandlingSuggestions', () => {
        it('should generate try/catch suggestions when missing', () => {
            const suggestions = generateErrorHandlingSuggestions([mockFunctionPattern], []);

            const tryCatchSuggestion = suggestions.find(
                (s) =>
                    s.type === 'ErrorHandling' &&
                    s.content.includes('try') &&
                    s.content.includes('catch')
            );

            expect(tryCatchSuggestion).toBeDefined();
            expect(tryCatchSuggestion?.confidence).toBeGreaterThanOrEqual(0.9);
        });

        it('should generate input validation suggestions', () => {
            const suggestions = generateErrorHandlingSuggestions([mockFunctionPattern], []);

            const validationSuggestion = suggestions.find(
                (s) =>
                    s.type === 'ErrorHandling' &&
                    s.content.includes('throw new Error') &&
                    s.content.includes('data')
            );

            expect(validationSuggestion).toBeDefined();
            expect(validationSuggestion?.confidence).toBeGreaterThanOrEqual(0.8);
        });

        it('should generate custom error class suggestions', () => {
            const suggestions = generateErrorHandlingSuggestions([mockFunctionPattern], []);

            const customErrorSuggestion = suggestions.find(
                (s) =>
                    s.type === 'ErrorHandling' &&
                    s.content.includes('class') &&
                    s.content.includes('extends Error')
            );

            expect(customErrorSuggestion).toBeDefined();
            expect(customErrorSuggestion?.confidence).toBeGreaterThanOrEqual(0.7);
        });

        it('should generate async error handling suggestions for async functions', () => {
            const suggestions = generateErrorHandlingSuggestions([mockAsyncPattern], []);

            const asyncErrorSuggestion = suggestions.find(
                (s) =>
                    s.type === 'ErrorHandling' &&
                    s.content.includes('Async error') &&
                    s.content.includes('fetchData')
            );

            expect(asyncErrorSuggestion).toBeDefined();
            expect(asyncErrorSuggestion?.confidence).toBeGreaterThanOrEqual(0.85);
        });

        it('should not generate async error handling suggestions for sync functions', () => {
            const suggestions = generateErrorHandlingSuggestions([mockFunctionPattern], []);

            const asyncErrorSuggestion = suggestions.find(
                (s) => s.type === 'ErrorHandling' && s.content.includes('Async error')
            );

            expect(asyncErrorSuggestion).toBeUndefined();
        });

        it('should generate appropriate validation for different parameter types', () => {
            const patternWithTypes: CodePattern = {
                type: 'FunctionPattern',
                name: 'validateUser',
                structure: {
                    params: [
                        { name: 'name', type: 'string' },
                        { name: 'age', type: 'number' },
                        { name: 'isActive', type: 'boolean' },
                        { name: 'tags', type: 'string[]' },
                        { name: 'metadata', type: 'object' },
                    ],
                    returnType: 'void',
                    hasTryCatch: false,
                    hasInputValidation: false,
                    hasCustomErrors: false,
                    isAsync: false,
                    hasAsyncErrorHandling: false,
                },
                frequency: 1,
            };

            const suggestions = generateErrorHandlingSuggestions([patternWithTypes], []);

            const validations = suggestions.filter(
                (s) => s.type === 'ErrorHandling' && s.content.includes('throw new Error')
            );

            expect(validations).toHaveLength(6);
            expect(validations.some((v) => v.content.includes('string'))).toBe(true);
            expect(validations.some((v) => v.content.includes('number'))).toBe(true);
            expect(validations.some((v) => v.content.includes('boolean'))).toBe(true);
            expect(validations.some((v) => v.content.includes('Array.isArray'))).toBe(true);
            expect(validations.some((v) => v.content.includes('object'))).toBe(true);
        });

        it('should not generate suggestions for functions with complete error handling', () => {
            const completePattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processData',
                structure: {
                    params: [{ name: 'data', type: 'any' }],
                    returnType: 'void',
                    hasTryCatch: true,
                    hasInputValidation: true,
                    hasCustomErrors: true,
                    isAsync: false,
                    hasAsyncErrorHandling: true,
                },
                frequency: 1,
            };

            const suggestions = generateErrorHandlingSuggestions([completePattern], []);

            expect(suggestions).toHaveLength(0);
        });

        it('should handle method patterns', () => {
            const methodPattern: CodePattern = {
                type: 'MethodPattern',
                name: 'processData',
                structure: {
                    params: [{ name: 'data', type: 'any' }],
                    returnType: 'void',
                    hasTryCatch: false,
                    hasInputValidation: false,
                    hasCustomErrors: false,
                    isAsync: false,
                    hasAsyncErrorHandling: false,
                },
                frequency: 1,
            };

            const suggestions = generateErrorHandlingSuggestions([methodPattern], []);

            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions.some((s) => s.type === 'ErrorHandling')).toBe(true);
        });
    });
});
