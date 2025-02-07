'use client';

import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

export default function CountLinesModal({ isOpen, onClose, title, scriptName }) {
    const [error, setError] = useState('');
    const [output, setOutput] = useState('');
    const [filePath, setFilePath] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Reset des états quand la modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setError('');
            setOutput('');
            setFilePath('');
            setSearchTerm('');
            setIsProcessing(false);
        }
    }, [isOpen]);

    // Charger la liste des fichiers au montage du composant
    useEffect(() => {
        const loadFiles = async () => {
            try {
                const response = await fetch('/api/list-files', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: '.' }),
                });

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des fichiers');
                }

                const data = await response.json();
                setFileList(data.files || []);
            } catch (err) {
                setError('Erreur lors du chargement des fichiers');
            }
        };

        if (isOpen) {
            loadFiles();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setOutput('');
        setIsProcessing(true);

        if (!filePath) {
            setError('Veuillez sélectionner un fichier');
            setIsProcessing(false);
            return;
        }

        try {
            const response = await fetch('/api/run-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: scriptName,
                    args: [filePath],
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'exécution du script");
            }

            const data = await response.json();
            setOutput(data.output);
        } catch (err) {
            setError("Erreur lors de l'exécution du script count-lines.mjs");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredFiles = fileList.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget && !isProcessing) {
                    onClose();
                }
            }}
        >
            <div className={`${styles.modal} ${styles.medium}`}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button
                        onClick={() => !isProcessing && onClose()}
                        className={styles.closeButton}
                        disabled={isProcessing}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.modalContent}>
                    <div className={styles.modalForm}>
                        <div className={styles.explanation}>
                            <h4>À propos de cet outil</h4>
                            <p>
                                Le compteur de lignes vous permet de compter le nombre de lignes
                                dans n&apos;importe quel fichier du projet.
                            </p>
                            <p>Pour utiliser l&apos;outil :</p>
                            <ol>
                                <li>Recherchez et sélectionnez un fichier dans la liste</li>
                                <li>&quot;Compter&quot; pour obtenir le nombre de lignes</li>
                            </ol>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalInputGroup}>
                                <label htmlFor="searchTerm">Rechercher un fichier :</label>
                                <input
                                    type="text"
                                    id="searchTerm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tapez pour filtrer..."
                                    className={styles.modalInput}
                                    disabled={isProcessing}
                                    autoComplete="off"
                                />
                            </div>

                            <div className={styles.fileList}>
                                {filteredFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.fileItem} ${filePath === file ? styles.selected : ''}`}
                                        onClick={() => setFilePath(file)}
                                    >
                                        {file}
                                    </div>
                                ))}
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            {output && (
                                <div className={styles.scriptOutput}>
                                    <pre>{output}</pre>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.modalButton}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Comptage en cours...' : 'Compter'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
