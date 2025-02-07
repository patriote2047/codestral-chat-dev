import { generateValidationSuggestions } from './validationSuggestions';
import { CodePattern } from '../parser/patternAnalyzer';

describe('Validation Suggestions', () => {
    const mockFunctionPattern: CodePattern = {
        type: 'FunctionPattern',
        name: 'processUser',
        structure: {
            params: [
                { name: 'name', type: 'string' },
                { name: 'age', type: 'number' },
            ],
            returnType: 'void',
            hasParameterValidation: false,
            hasReturnTypeValidation: false,
            hasAssertions: false,
        },
        frequency: 1,
    };

    describe('generateValidationSuggestions', () => {
        it('should generate parameter validation suggestions', () => {
            const suggestions = generateValidationSuggestions([mockFunctionPattern], []);

            const validations = suggestions.filter(
                (s) => s.type === 'Validation' && s.content.includes('throw new TypeError')
            );

            expect(validations).toHaveLength(2);
            expect(validations.some((v) => v.content.includes('string'))).toBe(true);
            expect(validations.some((v) => v.content.includes('number'))).toBe(true);
            expect(validations[0].confidence).toBeGreaterThanOrEqual(0.9);
        });

        it('should generate return type validation suggestions', () => {
            const functionWithReturn: CodePattern = {
                type: 'FunctionPattern',
                name: 'calculateTotal',
                structure: {
                    params: [],
                    returnType: 'number',
                    hasParameterValidation: true,
                    hasReturnTypeValidation: false,
                    hasAssertions: false,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([functionWithReturn], []);

            const returnValidation = suggestions.find(
                (s) =>
                    s.type === 'Validation' &&
                    s.content.includes('validateReturnType') &&
                    s.content.includes('number')
            );

            expect(returnValidation).toBeDefined();
            expect(returnValidation?.confidence).toBeGreaterThanOrEqual(0.8);
        });

        it('should generate assertion suggestions', () => {
            const suggestions = generateValidationSuggestions([mockFunctionPattern], []);

            const assertions = suggestions.find(
                (s) => s.type === 'Validation' && s.content.includes('console.assert')
            );

            expect(assertions).toBeDefined();
            expect(assertions?.confidence).toBeGreaterThanOrEqual(0.7);
            expect(assertions?.content).toContain("typeof name === 'string'");
            expect(assertions?.content).toContain("typeof age === 'number'");
        });

        it('should generate validation schema suggestions for complex types', () => {
            const complexPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processUserData',
                structure: {
                    params: [
                        { name: 'user', type: 'object' },
                        { name: 'roles', type: 'string[]' },
                    ],
                    returnType: 'void',
                    hasParameterValidation: false,
                    hasReturnTypeValidation: false,
                    hasAssertions: false,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([complexPattern], []);

            const zodSchema = suggestions.find(
                (s) =>
                    s.type === 'Validation' &&
                    s.content.includes('zod') &&
                    s.content.includes('z.object')
            );

            const yupSchema = suggestions.find(
                (s) =>
                    s.type === 'Validation' &&
                    s.content.includes('yup') &&
                    s.content.includes('yup.object')
            );

            expect(zodSchema).toBeDefined();
            expect(yupSchema).toBeDefined();
            expect(zodSchema?.confidence).toBeGreaterThanOrEqual(0.85);
            expect(yupSchema?.confidence).toBeGreaterThanOrEqual(0.85);
        });

        it('should not generate validation schema suggestions for simple types', () => {
            const simplePattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'increment',
                structure: {
                    params: [{ name: 'value', type: 'number' }],
                    returnType: 'number',
                    hasParameterValidation: false,
                    hasReturnTypeValidation: false,
                    hasAssertions: false,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([simplePattern], []);

            const schemas = suggestions.filter(
                (s) => s.content.includes('zod') || s.content.includes('yup')
            );

            expect(schemas).toHaveLength(0);
        });

        it('should generate validation schema suggestions for validation functions', () => {
            const validationPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'validateUserInput',
                structure: {
                    params: [{ name: 'input', type: 'any' }],
                    returnType: 'boolean',
                    hasParameterValidation: false,
                    hasReturnTypeValidation: false,
                    hasAssertions: false,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([validationPattern], []);

            const schemas = suggestions.filter((s) => s.content.includes('Schema'));

            expect(schemas.length).toBeGreaterThan(0);
        });

        it('should handle different parameter types correctly', () => {
            const mixedTypesPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processData',
                structure: {
                    params: [
                        { name: 'text', type: 'string' },
                        { name: 'count', type: 'number' },
                        { name: 'isValid', type: 'boolean' },
                        { name: 'data', type: 'object' },
                        { name: 'items', type: 'string[]' },
                    ],
                    returnType: 'void',
                    hasParameterValidation: false,
                    hasReturnTypeValidation: false,
                    hasAssertions: false,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([mixedTypesPattern], []);

            const validations = suggestions.filter(
                (s) => s.type === 'Validation' && s.content.includes('throw new TypeError')
            );

            expect(validations).toHaveLength(5);
            expect(validations.some((v) => v.content.includes('string'))).toBe(true);
            expect(validations.some((v) => v.content.includes('number'))).toBe(true);
            expect(validations.some((v) => v.content.includes('boolean'))).toBe(true);
            expect(validations.some((v) => v.content.includes('object'))).toBe(true);
            expect(validations.some((v) => v.content.includes('Array'))).toBe(true);
        });

        it('should not generate suggestions for already validated functions', () => {
            const validatedPattern: CodePattern = {
                type: 'FunctionPattern',
                name: 'processData',
                structure: {
                    params: [{ name: 'data', type: 'any' }],
                    returnType: 'void',
                    hasParameterValidation: true,
                    hasReturnTypeValidation: true,
                    hasAssertions: true,
                },
                frequency: 1,
            };

            const suggestions = generateValidationSuggestions([validatedPattern], []);

            expect(suggestions).toHaveLength(0);
        });
    });
});
