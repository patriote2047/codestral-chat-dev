import { ContextManager, ConversationContext, Message, ProjectContext } from './types';
import { initializeContextManager } from './contextManager';
import type { ProjectAction } from './types';

describe('Context Manager', () => {
    const mockDate = new Date('2024-02-04T12:00:00Z');
    let contextManager: ContextManager;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
        contextManager = initializeContextManager();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Context Storage', () => {
        it('should store and retrieve conversation context', () => {
            const sessionId = 'test-session-1';
            const context: ConversationContext = {
                messages: [
                    { role: 'user', content: 'Hello' },
                    { role: 'assistant', content: 'Hi there!' },
                ],
                projectContext: {
                    currentFile: 'src/app/page.tsx',
                    openFiles: ['src/app/page.tsx', 'src/app/layout.tsx'],
                    recentActions: [],
                    environment: { nodeVersion: '18.x', framework: 'next.js' },
                },
                userPreferences: {
                    language: 'fr',
                    theme: 'dark',
                },
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, context);
            const retrieved = contextManager.retrieve(sessionId);

            expect(retrieved).toEqual(context);
        });

        it('should return default context for non-existent session', () => {
            const sessionId = 'non-existent-session';
            const context = contextManager.retrieve(sessionId);

            expect(context.messages).toEqual([]);
            expect(context.projectContext.openFiles).toEqual([]);
            expect(context.projectContext.recentActions).toEqual([]);
            expect(context.projectContext.environment).toEqual({});
            expect(context.sessionMetadata.startTime).toBeDefined();
            expect(context.sessionMetadata.lastActivity).toBeDefined();
        });

        it('should update existing context partially with undefined fields', () => {
            const sessionId = 'test-session-2';
            const initialContext: ConversationContext = {
                messages: [],
                projectContext: {
                    currentFile: 'src/app/page.tsx',
                    openFiles: [],
                    recentActions: [],
                    environment: { nodeVersion: '18.x', framework: 'next.js' },
                },
                userPreferences: { language: 'fr', theme: 'light' },
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, initialContext);

            const update = {
                messages: [{ role: 'user', content: 'New message' }],
                userPreferences: undefined,
                projectContext: undefined,
            };

            contextManager.update(sessionId, update);
            const updated = contextManager.retrieve(sessionId);

            expect(updated.messages).toEqual(update.messages);
            expect(updated.userPreferences).toEqual(initialContext.userPreferences);
            expect(updated.projectContext).toEqual(initialContext.projectContext);
        });
    });

    describe('Context Management', () => {
        it('should limit context size to prevent token overflow', () => {
            const sessionId = 'test-session-3';
            const longContext: ConversationContext = {
                messages: Array(100).fill({ role: 'user', content: 'Test message' }),
                projectContext: {
                    currentFile: 'test.ts',
                    openFiles: [],
                    recentActions: [],
                    environment: {},
                },
                userPreferences: {},
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, longContext);
            const pruned = contextManager.retrieve(sessionId);

            expect(pruned.messages.length).toBeLessThan(100);
            expect(pruned.messages.length).toBeGreaterThan(0);
        });

        it('should maintain conversation coherence when pruning', () => {
            const sessionId = 'test-session-4';
            const context: ConversationContext = {
                messages: [
                    { role: 'user', content: 'Question 1' },
                    { role: 'assistant', content: 'Answer 1' },
                    { role: 'user', content: 'Follow-up to Answer 1' },
                ],
                projectContext: {
                    currentFile: 'test.ts',
                    openFiles: [],
                    recentActions: [],
                    environment: {},
                },
                userPreferences: {},
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, context);
            const pruned = contextManager.prune(context);

            const messages = pruned.messages;
            for (let i = 1; i < messages.length; i++) {
                if (messages[i].content.includes('Follow-up')) {
                    expect(messages[i - 1].content).toContain('Answer');
                }
            }
        });

        it('should handle empty context gracefully', () => {
            const emptyContext: ConversationContext = {
                messages: [],
                projectContext: {
                    openFiles: [],
                    recentActions: [],
                    environment: {},
                },
                userPreferences: {},
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            const pruned = contextManager.prune(emptyContext);
            expect(pruned.messages).toEqual([]);
            expect(pruned.projectContext.recentActions).toEqual([]);
        });

        it('should handle partial updates with missing fields', () => {
            const sessionId = 'test-session-8';
            const initialContext: ConversationContext = {
                messages: [],
                projectContext: {
                    currentFile: 'test.ts',
                    openFiles: [],
                    recentActions: [],
                    environment: {},
                },
                userPreferences: {},
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, initialContext);

            // Update avec des champs manquants
            const partialUpdate: Partial<ConversationContext> = {
                messages: [{ role: 'user', content: 'test' }],
                projectContext: {
                    currentFile: 'new.ts',
                } as ProjectContext, // Cast partiel pour tester la fusion
            };

            contextManager.update(sessionId, partialUpdate);
            const updated = contextManager.retrieve(sessionId);

            expect(updated.messages).toEqual(partialUpdate.messages);
            expect(updated.projectContext.currentFile).toBe('new.ts');
            expect(updated.projectContext.openFiles).toEqual([]);
            expect(updated.projectContext.recentActions).toEqual([]);
        });

        it('should handle updates with null values', () => {
            const sessionId = 'test-session-9';
            const initialContext: ConversationContext = {
                messages: [{ role: 'user', content: 'initial' }],
                projectContext: {
                    currentFile: 'test.ts',
                    openFiles: ['test.ts'],
                    recentActions: [],
                    environment: { test: true },
                },
                userPreferences: { theme: 'dark' },
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            contextManager.store(sessionId, initialContext);

            const update = {
                projectContext: {
                    currentFile: null,
                    environment: null,
                },
            };

            contextManager.update(sessionId, update as any);
            const updated = contextManager.retrieve(sessionId);

            expect(updated.projectContext.currentFile).toBeNull();
            expect(updated.projectContext.environment).toBeNull();
            expect(updated.projectContext.openFiles).toEqual(['test.ts']);
        });

        test('should handle updates with undefined optional fields', () => {
            const manager = initializeContextManager();
            const sessionId = 'test-session';
            const initialContext = manager.retrieve(sessionId);

            // Update with undefined optional fields
            manager.update(sessionId, {
                messages: ['New message'],
            });

            const updatedContext = manager.retrieve(sessionId);
            expect(updatedContext.messages).toEqual(['New message']);
            expect(updatedContext.projectContext).toEqual(initialContext.projectContext);
            expect(updatedContext.userPreferences).toEqual(initialContext.userPreferences);
            expect(updatedContext.sessionMetadata.lastActivity).toBeDefined();
        });

        it('should prune recent actions when exceeding maximum limit', () => {
            const sessionId = 'test-session-prune';
            const context: ConversationContext = {
                messages: [],
                projectContext: {
                    currentFile: 'test.ts',
                    openFiles: [],
                    recentActions: Array(25)
                        .fill(null)
                        .map((_, index) => ({
                            type: 'file_modified',
                            file: `file${index}.ts`,
                            timestamp: mockDate.toISOString(),
                        })),
                    environment: {},
                },
                userPreferences: {},
                sessionMetadata: {
                    startTime: mockDate.toISOString(),
                    lastActivity: mockDate.toISOString(),
                },
            };

            const pruned = contextManager.prune(context);
            expect(pruned.projectContext.recentActions.length).toBe(20);
            expect(pruned.projectContext.recentActions[19].file).toBe('file24.ts');
        });
    });

    describe('Project Context', () => {
        it('should track current file and open files', () => {
            const sessionId = 'test-session-5';
            const projectContext: ProjectContext = {
                currentFile: 'src/app/page.tsx',
                openFiles: ['src/app/page.tsx', 'src/app/layout.tsx'],
                recentActions: [
                    {
                        type: 'file_opened',
                        file: 'src/app/page.tsx',
                        timestamp: mockDate.toISOString(),
                    },
                ],
                environment: { nodeVersion: '18.x', framework: 'next.js' },
            };

            contextManager.updateProjectContext(sessionId, projectContext);
            const context = contextManager.retrieve(sessionId);

            expect(context.projectContext).toEqual(projectContext);
        });

        it('should maintain recent actions history with limit', () => {
            const sessionId = 'test-session-6';
            const actions = Array(25)
                .fill(null)
                .map((_, index) => ({
                    type: 'file_modified' as const,
                    file: `test${index}.ts`,
                    timestamp: mockDate.toISOString(),
                }));

            actions.forEach((action) => {
                contextManager.addAction(sessionId, action);
            });

            const context = contextManager.retrieve(sessionId);
            expect(context.projectContext.recentActions.length).toBeLessThanOrEqual(20);
            expect(context.projectContext.recentActions[19].file).toBe('test24.ts');
        });

        it('should handle concurrent actions correctly', () => {
            const sessionId = 'test-session-7';
            const action1 = {
                type: 'file_opened' as const,
                file: 'test1.ts',
                timestamp: mockDate.toISOString(),
            };
            const action2 = {
                type: 'file_modified' as const,
                file: 'test1.ts',
                timestamp: mockDate.toISOString(),
            };

            contextManager.addAction(sessionId, action1);
            contextManager.addAction(sessionId, action2);

            const context = contextManager.retrieve(sessionId);
            expect(context.projectContext.recentActions).toHaveLength(2);
            expect(context.projectContext.recentActions[0]).toEqual(action1);
            expect(context.projectContext.recentActions[1]).toEqual(action2);
        });
    });

    describe('updateProjectContext', () => {
        it('devrait mettre à jour le contexte du projet', () => {
            const sessionId = 'test-session';
            const projectContext: ProjectContext = {
                openFiles: ['new.js'],
                recentActions: [],
                environment: { framework: 'react' },
            };

            contextManager.updateProjectContext(sessionId, projectContext);
            const updated = contextManager.retrieve(sessionId);

            expect(updated.projectContext).toEqual(projectContext);
        });

        it("devrait préserver l'environnement existant lors de la mise à jour", () => {
            const sessionId = 'test-session';

            // Initialiser avec un environnement
            contextManager.updateProjectContext(sessionId, {
                openFiles: ['old.js'],
                recentActions: [],
                environment: { nodeVersion: '16' },
            });

            // Mettre à jour avec de nouvelles valeurs
            contextManager.updateProjectContext(sessionId, {
                openFiles: ['new.js'],
                recentActions: [],
                environment: { framework: 'react' },
            });

            const result = contextManager.retrieve(sessionId);

            // Vérifier que les fichiers sont mis à jour
            expect(result.projectContext.openFiles).toEqual(['new.js']);

            // Vérifier que l'environnement est fusionné correctement
            expect(result.projectContext.environment).toEqual({
                nodeVersion: '16',
                framework: 'react',
            });
        });
    });

    describe('addAction', () => {
        it('devrait ajouter une action au contexte', () => {
            const sessionId = 'test-session';
            const action: ProjectAction = {
                type: 'file_opened',
                file: 'test.js',
                timestamp: mockDate.toISOString(),
            };

            contextManager.addAction(sessionId, action);
            const context = contextManager.retrieve(sessionId);

            expect(context.projectContext.recentActions).toHaveLength(1);
            expect(context.projectContext.recentActions[0]).toEqual(action);
        });

        it("devrait limiter le nombre d'actions", () => {
            const sessionId = 'test-session';
            const actions: ProjectAction[] = Array(25)
                .fill(null)
                .map((_, i) => ({
                    type: 'file_opened',
                    file: `file${i}.js`,
                    timestamp: mockDate.toISOString(),
                }));

            actions.forEach((action) => contextManager.addAction(sessionId, action));
            const context = contextManager.retrieve(sessionId);

            expect(context.projectContext.recentActions).toHaveLength(20);
            expect(context.projectContext.recentActions[19].file).toBe('file24.js');
        });

        it("devrait préserver l'ordre chronologique des actions", () => {
            const sessionId = 'test-session';
            const actions: ProjectAction[] = Array(3)
                .fill(null)
                .map((_, i) => ({
                    type: 'file_opened',
                    file: `file${i}.js`,
                    timestamp: new Date(mockDate.getTime() + i * 1000).toISOString(),
                }));

            actions.forEach((action) => contextManager.addAction(sessionId, action));
            const context = contextManager.retrieve(sessionId);

            expect(context.projectContext.recentActions).toHaveLength(3);
            expect(context.projectContext.recentActions.map((a) => a.file)).toEqual([
                'file0.js',
                'file1.js',
                'file2.js',
            ]);
        });
    });
});
