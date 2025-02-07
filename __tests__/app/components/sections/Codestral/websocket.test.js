import { WebSocketManager } from './websocket';
import { io } from 'socket.io-client';
import { Server } from 'socket.io';

// Mock de socket.io-client
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
        removeAllListeners: jest.fn(),
        disconnect: jest.fn(),
    };
    return {
        io: jest.fn(() => mockSocket),
    };
});

describe('WebSocketManager', () => {
    let wsManager;
    let mockSocket;

    beforeEach(() => {
        wsManager = new WebSocketManager();
        mockSocket = io();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('Initialisation', () => {
        it('devrait créer une instance avec les paramètres par défaut', () => {
            expect(wsManager.isConnecting).toBe(false);
            expect(wsManager.reconnectAttempts).toBe(0);
            expect(wsManager.maxReconnectAttempts).toBe(5);
            expect(wsManager.reconnectDelay).toBe(1000);
            expect(wsManager.connectionTimeout).toBe(10000);
        });
    });

    describe('Connexion', () => {
        it('devrait se connecter avec succès', async () => {
            // Simuler une connexion réussie
            mockSocket.once.mockImplementation((event, callback) => {
                if (event === 'connect') {
                    setTimeout(callback, 100);
                }
            });

            const connectPromise = wsManager.connect('http://localhost:3001');
            jest.advanceTimersByTime(100);
            await connectPromise;

            expect(io).toHaveBeenCalledWith(
                'http://localhost:3001',
                expect.objectContaining({
                    transports: ['websocket', 'polling'],
                    path: '/socket.io',
                    withCredentials: true,
                })
            );
        });

        it('devrait gérer le timeout de connexion', async () => {
            const connectPromise = wsManager.connect('http://localhost:3001');
            jest.advanceTimersByTime(11000);

            await expect(connectPromise).rejects.toThrow('Timeout de connexion');
        });

        it('devrait gérer les erreurs de connexion', async () => {
            mockSocket.once.mockImplementation((event, callback) => {
                if (event === 'connect_error') {
                    setTimeout(() => callback(new Error('Connection refused')), 100);
                }
            });

            const connectPromise = wsManager.connect('http://localhost:3001');
            jest.advanceTimersByTime(100);

            await expect(connectPromise).rejects.toThrow('Connection refused');
        });
    });

    describe('Reconnexion', () => {
        it('devrait tenter de se reconnecter après une déconnexion', async () => {
            // Simuler une connexion initiale réussie
            mockSocket.once.mockImplementation((event, callback) => {
                if (event === 'connect') setTimeout(callback, 100);
            });

            await wsManager.connect('http://localhost:3001');
            jest.clearAllMocks();

            // Simuler une déconnexion
            const disconnectCallback = mockSocket.on.mock.calls.find(
                (call) => call[0] === 'disconnect'
            )[1];
            disconnectCallback('transport close');

            jest.advanceTimersByTime(1000);

            expect(io).toHaveBeenCalledTimes(1);
        });

        it('devrait respecter le nombre maximum de tentatives', async () => {
            wsManager.reconnectAttempts = wsManager.maxReconnectAttempts;
            const error = new Error('Connection error');
            await wsManager._handleConnectionError(error);

            expect(wsManager.reconnectAttempts).toBe(wsManager.maxReconnectAttempts);
            jest.advanceTimersByTime(10000);
            expect(io).not.toHaveBeenCalled();
        });
    });

    describe('Gestion des événements', () => {
        it('devrait émettre des événements correctement', () => {
            mockSocket.connected = true;
            wsManager.socket = mockSocket;

            wsManager.emit('test', { data: 'test' });

            expect(mockSocket.emit).toHaveBeenCalledWith('test', { data: 'test' });
        });

        it("devrait gérer les écouteurs d'événements", () => {
            const callback = jest.fn();
            wsManager.socket = mockSocket;

            wsManager.on('test', callback);

            expect(mockSocket.on).toHaveBeenCalledWith('test', callback);
        });

        it('devrait mettre à jour le statut correctement', () => {
            const statusCallback = jest.fn();
            wsManager.onStatusChange(statusCallback);

            wsManager._updateStatus('connected');

            expect(statusCallback).toHaveBeenCalledWith('connected');
        });
    });

    describe('Nettoyage', () => {
        it('devrait nettoyer les ressources lors de la fermeture', () => {
            wsManager.socket = mockSocket;
            const statusCallback = jest.fn();
            wsManager.onStatusChange(statusCallback);

            wsManager.close();

            expect(mockSocket.removeAllListeners).toHaveBeenCalled();
            expect(mockSocket.disconnect).toHaveBeenCalled();
            expect(wsManager.socket).toBeNull();
            expect(wsManager.statusListeners.size).toBe(0);
        });
    });
});
