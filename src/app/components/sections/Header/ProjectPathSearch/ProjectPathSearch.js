'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProjectPathSearch.module.css';

const ProjectPathSearch = () => {
    const [projectPath, setProjectPath] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        let isMounted = true;

        // Charger le chemin sauvegardé au démarrage
        const loadSavedPath = async () => {
            try {
                const response = await fetch('/api/save-project-path');
                const data = await response.json();
                if (isMounted && data.path) {
                    setProjectPath(data.path);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Erreur lors du chargement du chemin:', error);
                }
            }
        };

        loadSavedPath();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    const handleSelectFolder = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            // Récupérer le chemin complet
            let fullPath = '';
            try {
                // Récupérer le chemin relatif
                const relativePath = await dirHandle.resolve();
                if (relativePath) {
                    // Construire le chemin complet
                    fullPath = relativePath.join('\\');
                    // Si le chemin ne commence pas par un lecteur, utiliser le lecteur H:
                    if (!fullPath.match(/^[A-Z]:/i)) {
                        fullPath = `H:\\${fullPath}`;
                    }
                } else {
                    // Fallback : utiliser le chemin complet connu
                    fullPath = `H:\\server-cody\\codestral-chat-control-main\\${dirHandle.name}`;
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du chemin:', error);
                // Fallback : construire le chemin manuellement
                fullPath = `H:\\server-cody\\codestral-chat-control-main\\${dirHandle.name}`;
            }

            console.log('Chemin complet obtenu:', fullPath);
            setProjectPath(fullPath);

            // Sauvegarder le chemin via l'API
            try {
                setSaveStatus('saving');
                const response = await fetch('/api/save-project-path', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: fullPath }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
                }

                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(''), 2000);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du chemin:', error);
                setSaveStatus('error');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erreur lors de la sélection du dossier:', error);
                setSaveStatus('error');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pathSelector}>
                <button 
                    type="button"
                    onClick={handleSelectFolder}
                    className={styles.selectButton}
                    aria-label="Sélectionner le dossier du projet"
                >
                    Sélectionner un dossier
                </button>
                {projectPath && (
                    <div className={styles.pathDisplay} role="status">
                        <span className={styles.pathLabel}>Projet :</span>
                        <span className={styles.pathValue} title={projectPath}>
                            {projectPath}
                        </span>
                        {saveStatus && (
                            <span className={`${styles.saveStatus} ${styles[saveStatus]}`} aria-live="polite">
                                {saveStatus === 'saving' && '⏳'}
                                {saveStatus === 'saved' && '✓'}
                                {saveStatus === 'error' && '❌'}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPathSearch; 