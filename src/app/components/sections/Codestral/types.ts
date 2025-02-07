export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ProjectContext {
    currentFile?: string;
    openFiles: string[];
    recentActions: ProjectAction[];
    environment: {
        nodeVersion?: string;
        framework?: string;
        [key: string]: any;
    };
}

export interface ProjectAction {
    type: 'file_opened' | 'file_modified' | 'file_closed' | 'command_executed';
    file?: string;
    command?: string;
    timestamp: string;
}

export interface UserPreferences {
    language?: string;
    theme?: 'light' | 'dark';
    [key: string]: any;
}

export interface SessionMetadata {
    startTime: string;
    lastActivity: string;
    [key: string]: any;
}

export interface ConversationContext {
    messages: Message[];
    projectContext: ProjectContext;
    userPreferences: UserPreferences;
    sessionMetadata: SessionMetadata;
}

export interface ContextManager {
    store: (sessionId: string, context: ConversationContext) => void;
    retrieve: (sessionId: string) => ConversationContext;
    update: (sessionId: string, updates: Partial<ConversationContext>) => void;
    prune: (context: ConversationContext) => ConversationContext;
    updateProjectContext: (sessionId: string, projectContext: ProjectContext) => void;
    addAction: (sessionId: string, action: ProjectAction) => void;
}

export interface OptimizationMetrics {
    averageResponseTime: number;
    cacheHitRate: number;
    compressionRatio: number;
    cacheSize: number;
    maxCacheSize: number;
}

export interface CacheEntry {
    response: string;
    timestamp: number;
    accessCount: number;
}

export interface ResponseOptimizer {
    // Formatage
    format(input: string): string;

    // Cache
    cacheResponse(query: string, response: string): void;
    getCachedResponse(query: string): string | null;

    // Compression
    compress(data: string): Promise<string>;
    decompress(data: string): Promise<string>;

    // Métriques
    recordMetric(metricName: string, value: number): void;
    getMetrics(): OptimizationMetrics;
}
