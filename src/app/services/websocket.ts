import { Server } from 'socket.io';
import { EventEmitter } from 'events';
import { createServer } from 'http';

export class WebSocketService extends EventEmitter {
    private static instance: WebSocketService;
    private io: Server | null = null;
    private connectedClients = new Map<string, any>();
    private isInitialized = false;
    private port: number = 3001;
    private server: any = null;
    private currentStatus: 'inactive' | 'initializing' | 'active' | 'error' = 'inactive';

    private constructor() {
        super();
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    getStatus(): string {
        return this.currentStatus;
    }

    async initialize(port: number = 3001): Promise<Server | null> {
        if (this.isInitialized && this.io && this.server?.listening) {
            console.log('WebSocket service déjà initialisé et actif');
            this.currentStatus = 'active';
            return this.io;
        }

        this.port = port;
        console.log(`Démarrage du service WebSocket sur le port ${this.port}...`);
        this.currentStatus = 'initializing';

        try {
            this.server = createServer();
            this.io = new Server(this.server, {
                cors: {
                    origin: 'http://localhost:3000',
                    methods: ['GET', 'POST'],
                    credentials: true,
                },
                pingTimeout: 60000,
                pingInterval: 25000,
                connectTimeout: 45000,
                transports: ['websocket', 'polling'],
            });

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout lors du démarrage du serveur'));
                }, 10000);

                this.server.once('error', (error: Error) => {
                    clearTimeout(timeout);
                    reject(error);
                });

                this.server.listen(this.port, () => {
                    clearTimeout(timeout);
                    console.log(`Serveur WebSocket démarré sur le port ${this.port}`);
                    resolve();
                });
            });

            this.setupEventListeners();
            this.isInitialized = true;
            this.currentStatus = 'active';
            return this.io;
        } catch (error) {
            console.error("Erreur lors de l'initialisation:", error);
            this.currentStatus = 'error';
            throw error;
        }
    }

    private setupEventListeners() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            console.log('Nouveau client connecté:', socket.id);
            this.connectedClients.set(socket.id, socket);
            console.log('Clients connectés:', this.connectedClients.size);

            socket.on('disconnect', (reason) => {
                console.log('Client déconnecté:', socket.id, 'Raison:', reason);
                this.connectedClients.delete(socket.id);
                console.log('Clients connectés:', this.connectedClients.size);

                if (reason === 'transport close' || reason === 'ping timeout') {
                    console.log('Tentative de reconnexion automatique...');
                    this.emit('reconnect_attempt');
                }
            });

            socket.on('chat_message', async (data) => {
                try {
                    socket.data.lastActivity = Date.now();
                    console.log('Message reçu:', data);

                    socket.emit('message_confirmed', {
                        id: data.id,
                        status: 'received',
                        timestamp: Date.now(),
                    });

                    this.emit('user_message', {
                        id: data.id,
                        text: data.text,
                        type: 'user_message',
                        timestamp: Date.now(),
                        socket: socket.id,
                    });
                } catch (error) {
                    console.error('Erreur lors du traitement du message:', error);
                    socket.emit('message_error', {
                        id: data.id,
                        error: 'Erreur lors du traitement du message',
                        timestamp: Date.now(),
                    });
                }
            });

            socket.on('ping', () => {
                socket.data.lastActivity = Date.now();
                socket.emit('pong', Date.now() - socket.data.lastActivity);
            });
        });
    }

    getConnectedClients(): number {
        return this.connectedClients.size;
    }

    isRunning(): boolean {
        return this.server?.listening && this.io ? true : false;
    }

    sendToClient(socketId: string, event: string, data: any) {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
            socket.emit(event, data);
        }
    }

    broadcast(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    async shutdown() {
        if (!this.isInitialized) return;

        console.log('Arrêt du service WebSocket...');

        try {
            if (this.io) {
                const sockets = await this.io.fetchSockets();
                for (const socket of sockets) {
                    socket.disconnect(true);
                }
                this.io.close();
            }

            if (this.server?.listening) {
                await new Promise<void>((resolve) => {
                    this.server.close(() => resolve());
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'arrêt:", error);
        } finally {
            this.io = null;
            this.server = null;
            this.isInitialized = false;
            this.connectedClients.clear();
            this.currentStatus = 'inactive';
            console.log('Service WebSocket arrêté');
        }
    }
}
