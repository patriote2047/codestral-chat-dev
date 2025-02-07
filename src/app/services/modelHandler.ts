import { EventEmitter } from 'events';
import { WebSocketService } from './websocket';
import { responses } from './responses';

interface Message {
    id: string;
    text: string;
    timestamp: number;
    type?: string;
    sender?: string;
    socket?: string;  // ID du socket pour les réponses ciblées
}

export class ModelHandler extends EventEmitter {
    private static instance: ModelHandler;
    private wsService: WebSocketService;
    private context: any[] = [];
    private maxContextLength = 10;
    private processingMessages = new Set<string>();

    private constructor() {
        super();
        this.wsService = WebSocketService.getInstance();
        this.setupEventListeners();
    }

    static getInstance(): ModelHandler {
        if (!ModelHandler.instance) {
            ModelHandler.instance = new ModelHandler();
        }
        return ModelHandler.instance;
    }

    private setupEventListeners() {
        // Écouter les messages des utilisateurs
        this.wsService.on('user_message', async (message: Message) => {
            try {
                // Éviter le traitement multiple du même message
                if (this.processingMessages.has(message.id)) {
                    return;
                }
                this.processingMessages.add(message.id);

                console.log('ModelHandler: Message reçu:', message);

                // Ajouter le message au contexte
                this.addToContext({
                    role: 'user',
                    content: message.text,
                    timestamp: message.timestamp
                });

                // Indiquer que le traitement commence
                this.sendResponse({
                    id: message.id,
                    text: "...",
                    sender: 'assistant',
                    status: 'typing',
                    timestamp: Date.now()
                }, message.socket);

                // Traiter le message et obtenir la réponse
                const response = await this.processMessage(message);

                // Émettre la réponse finale
                this.sendResponse({
                    id: message.id,
                    text: response,
                    sender: 'assistant',
                    status: 'completed',
                    timestamp: Date.now()
                }, message.socket);

                // Ajouter la réponse au contexte
                this.addToContext({
                    role: 'assistant',
                    content: response,
                    timestamp: Date.now()
                });

            } catch (error: any) {
                console.error('Erreur lors du traitement par le modèle:', error);
                this.sendResponse({
                    id: message.id,
                    text: "Désolé, une erreur est survenue lors du traitement de votre message.",
                    sender: 'system',
                    error: true,
                    timestamp: Date.now()
                }, message.socket);
            } finally {
                this.processingMessages.delete(message.id);
            }
        });
    }

    private sendResponse(response: any, socketId?: string) {
        if (socketId) {
            // Envoyer la réponse au client spécifique
            this.wsService.sendToClient(socketId, 'chat_response', response);
        } else {
            // Diffuser la réponse à tous les clients
            this.wsService.broadcast('chat_response', response);
        }
    }

    private async processMessage(message: Message): Promise<string> {
        try {
            // Simuler un délai de traitement pour plus de naturel
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Utiliser le système de réponses
            const { findResponse } = require('./responses');
            const response = findResponse(message.text);

            if (!response) {
                throw new Error('Aucune réponse générée');
            }

            return response;
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            throw error;
        }
    }

    private addToContext(message: any) {
        this.context.push(message);
        if (this.context.length > this.maxContextLength) {
            this.context.shift(); // Supprimer le plus ancien message
        }
    }

    getContext() {
        return this.context;
    }

    clearContext() {
        this.context = [];
    }
} 