import { ChatEventMap, ChatEventHandler } from '../core/types';

export class EventEmitter {
    private handlers: Map<keyof ChatEventMap, Set<ChatEventHandler<any>>> = new Map();

    on<K extends keyof ChatEventMap>(event: K, handler: ChatEventHandler<K>): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);
    }

    off<K extends keyof ChatEventMap>(event: K, handler: ChatEventHandler<K>): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    emit<K extends keyof ChatEventMap>(event: K, data: ChatEventMap[K]): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach((handler) => handler(data));
        }
    }

    clear(): void {
        this.handlers.clear();
    }
}
