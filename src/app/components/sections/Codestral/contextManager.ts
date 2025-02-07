import { ContextManager, ConversationContext, ProjectContext, ProjectAction } from './types';

const MAX_MESSAGES = 50;
const MAX_ACTIONS = 20;

export function initializeContextManager(): ContextManager {
    const contexts = new Map<string, ConversationContext>();

    return {
        store(sessionId: string, context: ConversationContext) {
            const prunedContext = this.prune(context);
            contexts.set(sessionId, prunedContext);
        },

        retrieve(sessionId: string): ConversationContext {
            const context = contexts.get(sessionId);
            if (!context) {
                return {
                    messages: [],
                    projectContext: {
                        openFiles: [],
                        recentActions: [],
                        environment: {},
                    },
                    userPreferences: {},
                    sessionMetadata: {
                        startTime: new Date().toISOString(),
                        lastActivity: new Date().toISOString(),
                    },
                };
            }
            return context;
        },

        update(sessionId: string, updates: Partial<ConversationContext>) {
            const current = this.retrieve(sessionId);
            const updated = {
                ...current,
                ...updates,
                userPreferences: {
                    ...current.userPreferences,
                    ...updates.userPreferences,
                },
                projectContext: {
                    ...current.projectContext,
                    ...updates.projectContext,
                },
                sessionMetadata: {
                    ...current.sessionMetadata,
                    lastActivity: new Date().toISOString(),
                },
            };
            this.store(sessionId, updated);
        },

        prune(context: ConversationContext): ConversationContext {
            const pruned = JSON.parse(JSON.stringify(context));

            if (pruned.messages.length > MAX_MESSAGES) {
                pruned.messages = pruned.messages.slice(-MAX_MESSAGES);
            }

            if (pruned.projectContext.recentActions.length > MAX_ACTIONS) {
                pruned.projectContext.recentActions =
                    pruned.projectContext.recentActions.slice(-MAX_ACTIONS);
            }

            return pruned;
        },

        updateProjectContext(sessionId: string, projectContext: ProjectContext) {
            const current = this.retrieve(sessionId);
            this.update(sessionId, {
                projectContext: {
                    ...current.projectContext,
                    ...projectContext,
                    environment: {
                        ...current.projectContext.environment,
                        ...projectContext.environment,
                    },
                },
            });
        },

        addAction(sessionId: string, action: ProjectAction) {
            const current = this.retrieve(sessionId);
            const updatedActions = [...current.projectContext.recentActions, action];

            this.updateProjectContext(sessionId, {
                ...current.projectContext,
                recentActions: updatedActions.slice(-MAX_ACTIONS),
            });
        },
    };
}
