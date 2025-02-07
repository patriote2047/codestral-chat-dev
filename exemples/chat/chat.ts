export { ChatController } from './core/ChatController';
export { ChatModel } from './core/ChatModel';
export type { ChatMessage, ChatState, ChatConfig } from './core/types';

// Fonction d'initialisation du chat
export function initChat(containerId: string, config?: ChatConfig): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/chat/styles/chat.css';
    document.head.appendChild(link);

    new ChatController(containerId, config);
}
