import { WebSocketService } from './websocket';
import { ModelHandler } from './modelHandler';

let isInitialized = false;

export async function initializeServices() {
    if (isInitialized) {
        return;
    }

    try {
        // Initialiser le WebSocket
        const wsService = WebSocketService.getInstance();
        await wsService.initialize();

        // Initialiser le ModelHandler
        ModelHandler.getInstance();

        isInitialized = true;
        console.log('Services initialisés avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
    }
}

// Initialiser au démarrage de l'application
initializeServices(); 