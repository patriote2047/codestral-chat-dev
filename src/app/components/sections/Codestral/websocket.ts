import { io, Socket } from 'socket.io-client';

// Types pour l'export
export interface WebSocketManagerInterface {
    connect(url: string): Promise<void>;
    isConnected(): boolean;
    emit(event: string, data: any): void;
    on(event: string, callback: (data: any) => void): void;
    onStatusChange(callback: (status: string) => void): void;
}

// Classe adaptateur pour le composant
export class WebSocketManager implements WebSocketManagerInterface {
    private socket: Socket | null = null;
    private statusListeners: ((status: string) => void)[] = [];
    private messageListeners: Map<string, ((data: any) => void)[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    async connect(url: string): Promise<void> {
        try {
            if (this.socket?.connected) {
                console.log('WebSocket déjà connecté');
                this.notifyStatusChange('connected');
                return;
            }

            this.socket = io(url, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            await new Promise<void>((resolve, reject) => {
                if (!this.socket) {
                    reject(new Error('Socket non initialisé'));
                    return;
                }

                const timeout = setTimeout(() => {
                    reject(new Error('Timeout de connexion'));
                }, 10000);

                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.notifyStatusChange('connected');
                    this.reconnectAttempts = 0;
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Erreur de connexion:', error);
                    this.notifyStatusChange('error');
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('Déconnecté:', reason);
                    this.notifyStatusChange('disconnected');
                });

                this.socket.on('reconnect_attempt', () => {
                    this.notifyStatusChange('connecting');
                });
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            this.notifyStatusChange('error');
            throw error;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    emit(event: string, data: any): void {
        if (!this.socket?.connected) {
            console.warn('WebSocket non connecté');
            this.notifyStatusChange('disconnected');
            return;
        }
        this.socket.emit(event, data);
    }

    on(event: string, callback: (data: any) => void): void {
        if (!this.messageListeners.has(event)) {
            this.messageListeners.set(event, []);
        }
        this.messageListeners.get(event)?.push(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    onStatusChange(callback: (status: string) => void): void {
        this.statusListeners.push(callback);
    }

    private notifyStatusChange(status: string): void {
        this.statusListeners.forEach((listener) => listener(status));
    }
}
