import { WebSocketManager } from './websocket';

describe('WebSocketManager', () => {
    let wsManager: WebSocketManager;

    beforeEach(() => {
        wsManager = new WebSocketManager();
        // Reset l'environnement de test
        process.env.NODE_ENV = 'test';
    });

    describe('Configuration temps réel', () => {
        test('devrait se connecter au serveur WebSocket', async () => {
            const connected = await wsManager.connect('ws://localhost:3000');
            expect(connected).toBe(true);
            // Attendre que la connexion soit établie
            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(wsManager.isConnected()).toBe(true);
        });

        test('devrait configurer les options de connexion', () => {
            wsManager.configure({
                reconnectAttempts: 3,
                reconnectInterval: 1000,
                pingInterval: 30000,
            });
            expect(wsManager.getConfig()).toEqual({
                reconnectAttempts: 3,
                reconnectInterval: 1000,
                pingInterval: 30000,
            });
        });
    });

    describe('Gestion des événements', () => {
        test('devrait émettre et recevoir des messages', (done) => {
            wsManager.on('test-event', (data) => {
                expect(data).toEqual({ message: 'test' });
                done();
            });
            wsManager.emit('test-event', { message: 'test' });
        });

        test("devrait gérer plusieurs écouteurs d'événements", () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            wsManager.on('event', handler1);
            wsManager.on('event', handler2);
            wsManager.emit('event', { data: 'test' });

            expect(handler1).toHaveBeenCalledWith({ data: 'test' });
            expect(handler2).toHaveBeenCalledWith({ data: 'test' });
        });
    });

    describe('Statut de connexion', () => {
        test("devrait suivre l'état de la connexion", () => {
            expect(wsManager.isConnected()).toBe(false);
            wsManager.mockConnect();
            expect(wsManager.isConnected()).toBe(true);
            wsManager.mockDisconnect();
            expect(wsManager.isConnected()).toBe(false);
        });

        test("devrait émettre des événements de changement d'état", (done) => {
            wsManager.onStatusChange((status) => {
                expect(status).toBe('connected');
                done();
            });
            wsManager.mockConnect();
        });
    });

    describe('Reconnexion automatique', () => {
        test('devrait tenter de se reconnecter après une déconnexion', async () => {
            const reconnectSpy = jest.spyOn(wsManager, 'connect');
            wsManager.configure({ reconnectAttempts: 1 });
            await wsManager.connect('ws://localhost:3000');

            // Premier appel pour la connexion initiale
            expect(reconnectSpy).toHaveBeenCalledTimes(1);

            wsManager.mockDisconnect();
            // Deuxième appel pour la tentative de reconnexion
            expect(reconnectSpy).toHaveBeenCalledTimes(2);
        });

        test('devrait respecter le nombre maximum de tentatives de reconnexion', async () => {
            const maxAttempts = 3;
            wsManager.configure({ reconnectAttempts: maxAttempts });
            const reconnectSpy = jest.spyOn(wsManager, 'connect');

            // Première connexion
            await wsManager.connect('ws://localhost:3000');
            expect(reconnectSpy).toHaveBeenCalledTimes(1);

            // Simuler plusieurs déconnexions
            for (let i = 0; i < maxAttempts; i++) {
                wsManager.mockDisconnect();
            }

            // Nombre total d'appels = connexion initiale + tentatives de reconnexion
            expect(reconnectSpy).toHaveBeenCalledTimes(maxAttempts + 1);
        });
    });

    describe('Gestion des erreurs', () => {
        test('devrait gérer les erreurs de connexion', async () => {
            const errorHandler = jest.fn();
            wsManager.onError(errorHandler);
            process.env.NODE_ENV = 'development'; // Forcer le mode non-test
            await wsManager.connect('invalid-url');

            expect(errorHandler).toHaveBeenCalled();
        });

        test('devrait nettoyer les ressources à la fermeture', async () => {
            await wsManager.connect('ws://localhost:3000');
            await new Promise((resolve) => setTimeout(resolve, 10));
            wsManager.close();

            expect(wsManager.isConnected()).toBe(false);
            expect(wsManager.getEventListeners()).toEqual({});
        });
    });
});
