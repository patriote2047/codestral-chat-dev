'use client';

import React, { useState } from 'react';
import styles from './ChatComponent.module.css';

const ChatComponent = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMessages([...messages, { text: inputValue, sender: 'user' }]);
            setInputValue('');
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Zone Top : Titre et Status */}
            <div className={styles.chatTop}>
                <div className={styles.modelInfo}>
                    <h2>Codestral Chat</h2>
                    <span className={styles.modelStatus}>
                        <span className={styles.statusDot}></span>
                        Actif
                    </span>
                </div>
                <div className={styles.sessionInfo}>
                    <span>Session #1234</span>
                    <span className={styles.sessionTime}>2h15m</span>
                </div>
            </div>

            {/* Zone Messages */}
            <div className={styles.chatMessages}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${
                            message.sender === 'user' ? styles.userMessage : styles.botMessage
                        }`}
                    >
                        <div className={styles.messageContent}>{message.text}</div>
                    </div>
                ))}
            </div>

            {/* Zone Input */}
            <div className={styles.chatInputZone}>
                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className={styles.chatInput}
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className={styles.sendButton}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
