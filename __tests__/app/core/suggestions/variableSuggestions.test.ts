import { generateVariableSuggestions } from './variableSuggestions';
import { CodePattern } from '../parser/patternAnalyzer';

describe('Variable Suggestions', () => {
    const mockVariablePattern: CodePattern = {
        type: 'VariablePattern',
        name: 'MAX_USER_COUNT',
        structure: {
            type: 'number',
            kind: 'let',
            hasJSDoc: false,
            isReassigned: false,
            isMutated: false,
            initializer: {
                type: 'NumericLiteral',
                value: 100,
            },
        },
        frequency: 1,
    };

    const mockExistingPattern: CodePattern = {
        type: 'VariablePattern',
        name: 'totalCount',
        structure: {
            type: 'number',
            kind: 'const',
            hasJSDoc: true,
            isReassigned: false,
            isMutated: false,
        },
        frequency: 2,
    };

    describe('generateVariableSuggestions', () => {
        it('should generate suggestions for similar variables', () => {
            const suggestions = generateVariableSuggestions(
                [mockVariablePattern],
                [mockExistingPattern]
            );

            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions.some((s) => s.type === 'VariableNaming')).toBe(true);
        });

        it('should generate documentation suggestions when missing', () => {
            const suggestions = generateVariableSuggestions([mockVariablePattern], []);

            const docSuggestion = suggestions.find(
                (s) =>
                    s.type === 'VariableNaming' &&
                    s.content.includes('@type') &&
                    s.content.includes('number')
            );

            expect(docSuggestion).toBeDefined();
            expect(docSuggestion?.confidence).toBeGreaterThanOrEqual(0.9);
        });

        it('should suggest converting to constant when appropriate', () => {
            const suggestions = generateVariableSuggestions([mockVariablePattern], []);

            const constSuggestion = suggestions.find(
                (s) =>
                    s.type === 'VariableNaming' &&
                    s.content.includes('const') &&
                    s.content.includes('MAX_USER_COUNT')
            );

            expect(constSuggestion).toBeDefined();
            expect(constSuggestion?.confidence).toBeGreaterThanOrEqual(0.8);
        });

        it('should generate type annotation suggestions when missing', () => {
            const untypedPattern: CodePattern = {
                type: 'VariablePattern',
                name: 'isActive',
                structure: {
                    kind: 'let',
                    hasJSDoc: false,
                    isReassigned: false,
                    isMutated: false,
                },
                frequency: 1,
            };

            const suggestions = generateVariableSuggestions([untypedPattern], []);

            const typeSuggestion = suggestions.find(
                (s) => s.type === 'VariableNaming' && s.content.includes('boolean')
            );

            expect(typeSuggestion).toBeDefined();
            expect(typeSuggestion?.confidence).toBeGreaterThanOrEqual(0.7);
        });

        it('should not generate constant suggestions for reassigned variables', () => {
            const reassignedPattern: CodePattern = {
                type: 'VariablePattern',
                name: 'counter',
                structure: {
                    type: 'number',
                    kind: 'let',
                    hasJSDoc: false,
                    isReassigned: true,
                    isMutated: false,
                },
                frequency: 1,
            };

            const suggestions = generateVariableSuggestions([reassignedPattern], []);

            const constSuggestion = suggestions.find(
                (s) => s.type === 'VariableNaming' && s.content.includes('const')
            );

            expect(constSuggestion).toBeUndefined();
        });

        it('should calculate similarity confidence correctly', () => {
            const suggestions = generateVariableSuggestions(
                [mockVariablePattern],
                [mockExistingPattern]
            );

            const similarSuggestion = suggestions.find(
                (s) => s.type === 'VariableNaming' && s.content.includes('Similar to totalCount')
            );

            expect(similarSuggestion).toBeDefined();
            expect(similarSuggestion?.confidence).toBeGreaterThan(0);
            expect(similarSuggestion?.confidence).toBeLessThanOrEqual(1);
        });

        it('should infer types correctly from variable names', () => {
            const patterns: CodePattern[] = [
                {
                    type: 'VariablePattern',
                    name: 'isEnabled',
                    structure: {
                        kind: 'let',
                        hasJSDoc: false,
                        isReassigned: false,
                        isMutated: false,
                    },
                    frequency: 1,
                },
                {
                    type: 'VariablePattern',
                    name: 'userName',
                    structure: {
                        kind: 'let',
                        hasJSDoc: false,
                        isReassigned: false,
                        isMutated: false,
                    },
                    frequency: 1,
                },
                {
                    type: 'VariablePattern',
                    name: 'items',
                    structure: {
                        kind: 'let',
                        hasJSDoc: false,
                        isReassigned: false,
                        isMutated: false,
                    },
                    frequency: 1,
                },
            ];

            const suggestions = generateVariableSuggestions(patterns, []);

            const booleanSuggestion = suggestions.find(
                (s) => s.content.includes('isEnabled') && s.content.includes('boolean')
            );
            const stringSuggestion = suggestions.find(
                (s) => s.content.includes('userName') && s.content.includes('string')
            );
            const arraySuggestion = suggestions.find(
                (s) => s.content.includes('items') && s.content.includes('[]')
            );

            expect(booleanSuggestion).toBeDefined();
            expect(stringSuggestion).toBeDefined();
            expect(arraySuggestion).toBeDefined();
        });

        it('should generate appropriate default values', () => {
            const patterns: CodePattern[] = [
                {
                    type: 'VariablePattern',
                    name: 'message',
                    structure: {
                        type: 'string',
                        kind: 'let',
                        hasJSDoc: false,
                        isReassigned: false,
                        isMutated: false,
                    },
                    frequency: 1,
                },
                {
                    type: 'VariablePattern',
                    name: 'count',
                    structure: {
                        type: 'number',
                        kind: 'let',
                        hasJSDoc: false,
                        isReassigned: false,
                        isMutated: false,
                    },
                    frequency: 1,
                },
            ];

            const suggestions = generateVariableSuggestions(patterns, []);

            const stringSuggestion = suggestions.find(
                (s) => s.content.includes('message') && s.content.includes("''")
            );
            const numberSuggestion = suggestions.find(
                (s) => s.content.includes('count') && s.content.includes('0')
            );

            expect(stringSuggestion).toBeDefined();
            expect(numberSuggestion).toBeDefined();
        });
    });
});
