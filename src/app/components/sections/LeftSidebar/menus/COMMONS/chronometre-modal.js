'use client';

import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

export default function ChronometreModal({ 
    isOpen, 
    onClose, 
    title,
    command,
    scriptName
}) {
    const [error, setError] = useState('');
    const [output, setOutput] = useState('');
    const [duration, setDuration] = useState('');
    const [message, setMessage] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(null);

    // Reset des états quand la modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setError('');
            setOutput('');
            setDuration('');
            setMessage('');
            setCurrentTime(null);
            setIsRunning(false);
        }
    }, [isOpen]);

    // Gestion du timer
    useEffect(() => {
        let timer;
        if (isRunning && currentTime > 0) {
            timer = setTimeout(() => {
                setCurrentTime(prev => prev - 1);
            }, 1000);
        } else if (isRunning && currentTime === 0) {
            setIsRunning(false);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isRunning, currentTime]);

    const handleDurationChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setDuration(value);
    };

    const handleCommandClick = async () => {
        setError('');
        setOutput('');

        if (!duration) {
            setError('Veuillez entrer une durée en secondes');
            return;
        }

        try {
            setIsRunning(true);
            setCurrentTime(parseInt(duration));

            const args = [];
            if (command.needsMessage) {
                if (!message) {
                    setError('Veuillez entrer un message');
                    setIsRunning(false);
                    return;
                }
                args.push(duration, `"${message}"`);
            } else {
                args.push(duration);
            }
            
            const response = await fetch('/api/run-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: 'COMMONS/chronometre.mjs',
                    args
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'exécution du script');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Afficher directement la sortie du script qui contient déjà le décompte
            setOutput(data.output);
            setIsRunning(false);
            setCurrentTime(null);

        } catch (error) {
            setError(error.message);
            setIsRunning(false);
            setCurrentTime(null);
        }
    };

    const getDisplayText = () => {
        return output || 'En attente...';
    };

    if (!isOpen) return null;

    return (
        <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
                if (e.target === e.currentTarget && !isRunning) {
                    onClose();
                }
            }}
        >
            <div className={`${styles.modal} ${styles.medium}`}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button 
                        onClick={() => !isRunning && onClose()}
                        className={styles.closeButton}
                        disabled={isRunning}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.modalContent}>
                    <div className={styles.modalForm}>
                        <div className={styles.explanation}>
                            <p>{command?.description}</p>
                        </div>

                        <div className={styles.modalInputGroup}>
                            <label htmlFor="duration">Durée (en secondes) :</label>
                            <input
                                type="text"
                                id="duration"
                                value={duration}
                                onChange={handleDurationChange}
                                placeholder="Entrez un nombre de secondes"
                                className={styles.modalInput}
                                disabled={isRunning}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>

                        {command?.needsMessage && (
                            <div className={styles.modalInputGroup}>
                                <label htmlFor="message">Message de fin :</label>
                                <input
                                    type="text"
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Message à afficher à la fin"
                                    className={styles.modalInput}
                                    disabled={isRunning}
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {(output || isRunning) && (
                            <div className={styles.scriptOutput}>
                                <pre>{getDisplayText()}</pre>
                            </div>
                        )}

                        <button 
                            onClick={handleCommandClick}
                            className={styles.modalButton}
                            disabled={isRunning}
                        >
                            {isRunning ? 'En cours...' : 'Démarrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 