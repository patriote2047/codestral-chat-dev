'use client';

import React, { useState, useId, useEffect, useRef } from 'react';
import styles from './ChatComponent.module.css';
import { WebSocketManager } from './websocket.ts';
import { v4 as uuidv4 } from 'uuid';

// Fonction utilitaire pour formater l'heure
const getFormattedTime = () => {
    return new Date().toLocaleTimeString();
};

const ChatComponent = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [status, setStatus] = useState('disconnected');
    const sessionId = useId();
    const wsManager = useRef(null);
    const [latency, setLatency] = useState(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        // Initialisation du temps après le montage du composant
        setCurrentTime(getFormattedTime());

        // Mettre à jour l'heure toutes les secondes
        const timer = setInterval(() => {
            setCurrentTime(getFormattedTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        // Créer une seule instance de WebSocketManager (singleton)
        if (!wsManager.current) {
            wsManager.current = new WebSocketManager();
        }

        let isSubscribed = true;

        // Gestion du statut de connexion
        const unsubscribeStatus = wsManager.current.onStatusChange((newStatus) => {
            if (isSubscribed) {
                setStatus(newStatus);
                if (newStatus === 'connected') {
                    setError(null);
                }
            }
        });

        const setupWebSocket = async () => {
            try {
                // Vérifier si déjà connecté
                if (wsManager.current.isConnected()) {
                    console.log('WebSocket déjà connecté');
                    setStatus('connected');
                    return;
                }

                await wsManager.current.connect('http://localhost:3001');

                // Configuration des écouteurs d'événements (une seule fois)
                if (isSubscribed) {
                    wsManager.current.on('chat_response', (response) => {
                        if (!isSubscribed) return;

                        setMessages((prev) => {
                            // Filtrer les messages existants avec le même ID
                            const filteredMessages = prev.filter((msg) => msg.id !== response.id);

                            // Créer le nouveau message avec un timestamp formaté
                            const newMessage = {
                                ...response,
                                timestamp: getFormattedTime(),
                                type: 'bot',
                            };

                            return [...filteredMessages, newMessage];
                        });

                        if (response.status === 'completed') {
                            setIsLoading(false);
                        }
                    });

                    wsManager.current.on('message_confirmed', (data) => {
                        console.log('Message confirmé:', data);
                    });

                    wsManager.current.on('message_error', (error) => {
                        if (!isSubscribed) return;
                        console.error('Erreur de message:', error);
                        setError("Erreur lors de l'envoi du message");
                        setIsLoading(false);
                    });
                }
            } catch (error) {
                if (!isSubscribed) return;
                console.error('Erreur de connexion:', error);
                setError('Erreur de connexion au serveur');
                setStatus('disconnected');
            }
        };

        setupWebSocket();

        return () => {
            isSubscribed = false;
            unsubscribeStatus();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !wsManager.current?.isConnected()) return;

        const messageId = uuidv4();
        const timestamp = getFormattedTime();

        const newMessage = {
            id: messageId,
            text: inputValue,
            type: 'user',
            sender: 'user',
            timestamp: timestamp,
            status: 'sent',
        };

        try {
            setMessages((prev) => [...prev, newMessage]);
            setInputValue('');
            setIsLoading(true);
            setError(null);

            wsManager.current.emit('chat_message', {
                id: messageId,
                text: inputValue,
                sender: 'user',
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            setError("Erreur lors de l'envoi du message");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Zone Top : Titre et Status */}
            <div className={styles.chatTop}>
                <div className={styles.modelInfo}>
                    <h2>Codestral Chat</h2>
                    <span className={styles.modelStatus}>
                        <span
                            data-testid="status-dot"
                            className={`${styles.statusDot} ${isLoading ? styles.loading : ''} ${status === 'connected' ? styles.connected : status === 'connecting' ? styles.connecting : ''}`}
                        ></span>
                        {isLoading
                            ? 'En cours...'
                            : status === 'connected'
                              ? 'Actif'
                              : status === 'connecting'
                                ? 'Connexion...'
                                : 'Hors ligne'}
                    </span>
                </div>
                <div className={styles.sessionInfo}>
                    <span>Session #{sessionId}</span>
                    <span className={styles.sessionTime}>{currentTime}</span>
                </div>
            </div>

            {/* Zone Messages */}
            <div className={`${styles.chatMessages} ${styles.scrollbarCustom}`}>
                {messages.map((msg, index) => {
                    const messageKey = `${msg.id}-${msg.status || msg.type}-${index}`;
                    const isTyping = msg.status === 'typing';
                    const messageContent = isTyping ? '...' : msg.text || msg.content;
                    const messageType = msg.sender === 'user' ? 'user' : 'bot';

                    return (
                        <div
                            key={messageKey}
                            className={`${styles.message} ${messageType === 'user' ? styles.userMessage : styles.botMessage}`}
                        >
                            <div className={styles.messageContent}>
                                {messageContent}
                                <small>{msg.timestamp}</small>
                            </div>
                        </div>
                    );
                })}
                {error && (
                    <div className={styles.errorMessage}>
                        <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="currentColor"
                            className={styles.errorIcon}
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                        {status === 'disconnected' && (
                            <button
                                onClick={() => wsManager.current?.connect('http://localhost:3001')}
                                className={styles.retryButton}
                            >
                                Réessayer
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Zone Input */}
            <div className={styles.chatInputZone}>
                <form onSubmit={handleSubmit} className={styles.inputForm} data-testid="chat-form">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className={styles.chatInput}
                        rows={1}
                        disabled={isLoading || status !== 'connected'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={isLoading || status !== 'connected'}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>

            {latency && <div className={styles.latencyInfo}>Latence: {latency}ms</div>}
        </div>
    );
};

export default ChatComponent;
