'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

export default function ShowTimeModal({ isOpen, onClose, title, command, scriptName }) {
    const [error, setError] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Reset des états quand la modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setError('');
            setOutput('');
            setIsRunning(false);
            setCurrentTime(0);
        }
    }, [isOpen]);

    const handleCommandClick = useCallback(async () => {
        setError('');
        setOutput('');

        try {
            setIsRunning(true);

            const response = await fetch('/api/run-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: scriptName,
                    args: command?.args || [],
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'exécution du script");
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setOutput(data.output);
            setIsRunning(false);
        } catch (error) {
            setError(error.message);
            setIsRunning(false);
        }
    }, [command?.args, scriptName]);

    // Exécuter la commande au montage de la modal
    useEffect(() => {
        if (isOpen && command) {
            handleCommandClick();
        }
    }, [isOpen, command]);

    useEffect(() => {
        if (isRunning && currentTime > 0) {
            const timer = setInterval(() => {
                handleCommandClick();
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isRunning, currentTime, handleCommandClick]);

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

                        {error && <div className={styles.error}>{error}</div>}

                        {output && (
                            <div className={styles.scriptOutput}>
                                <pre>{output}</pre>
                            </div>
                        )}

                        <button
                            onClick={handleCommandClick}
                            className={styles.modalButton}
                            disabled={isRunning}
                        >
                            Rafraîchir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
