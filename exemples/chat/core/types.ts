export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface ChatState {
    messages: ChatMessage[];
    isProcessing: boolean;
    error: string | null;
}

export interface ChatConfig {
    initialMessages?: ChatMessage[];
    maxMessages?: number;
    temperature?: number;
    maxTokens?: number;
}

export interface ChatEventMap {
    'message:sent': ChatMessage;
    'message:received': ChatMessage;
    error: Error;
    'state:change': ChatState;
}

export type ChatEventHandler<K extends keyof ChatEventMap> = (data: ChatEventMap[K]) => void;
