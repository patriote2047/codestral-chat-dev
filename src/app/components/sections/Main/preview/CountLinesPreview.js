'use client';

import React, { useState } from 'react';
import styles from './CountLinesPreview.module.css';

export default function CountLinesPreview() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileStats, setFileStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Créer un FormData pour envoyer le fichier
        const formData = new FormData();
        formData.append('file', file);

        setSelectedFile(file.name);
        setIsLoading(true);
        setError(null);

        try {
            // D'abord, on upload le fichier
            const uploadResponse = await fetch('/api/upload-temp-file', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Erreur lors de l\'upload du fichier');
            }

            const { tempPath } = await uploadResponse.json();

            // Ensuite, on analyse le fichier avec le script
            const response = await fetch('/api/run-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: 'COMMONS/count-lines.mjs',
                    args: [tempPath]
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'analyse du fichier');
            }

            const data = await response.json();
            
            // Parser la sortie pour extraire les statistiques
            const stats = parseCountLinesOutput(data.output);
            setFileStats(stats);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour parser la sortie du script count-lines.mjs
    const parseCountLinesOutput = (output) => {
        try {
            // Extraire les nombres des lignes correspondantes
            const totalMatch = output.match(/Total des lignes:\s*(\d+)/);
            const codeMatch = output.match(/Lignes de code:\s*(\d+)/);
            const commentsMatch = output.match(/Lignes de commentaires:\s*(\d+)/);
            const emptyMatch = output.match(/Lignes vides:\s*(\d+)/);

            if (!totalMatch || !codeMatch || !commentsMatch || !emptyMatch) {
                throw new Error('Format de sortie invalide');
            }

            return {
                total: parseInt(totalMatch[1]),
                code: parseInt(codeMatch[1]),
                comments: parseInt(commentsMatch[1]),
                empty: parseInt(emptyMatch[1])
            };
        } catch (err) {
            console.error('Erreur lors du parsing de la sortie:', err);
            throw new Error('Impossible de parser les résultats');
        }
    };

    return (
        <div className={styles.container}>
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {isLoading && (
                <div className={styles.loading}>
                    Analyse en cours...
                </div>
            )}

            <div className={styles.previewBox}>
                <div className={styles.header}>
                    <label className={styles.fileInput}>
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            accept=".js,.jsx,.ts,.tsx,.css,.scss,.py,.java,.php,.html,.xml,.yaml,.md"
                        />
                        <span className={styles.uploadButton}>
                            {selectedFile ? 'Changer' : 'Choisir un fichier'}
                        </span>
                    </label>
                    <span className={styles.fileInfo}>{selectedFile || 'Aucun fichier sélectionné'}</span>
                    <span></span>
                </div>
                {fileStats && (
                    <div className={styles.content}>
                        <div className={styles.stats}>
                            <div className={styles.statRow}>
                                <span className={styles.label}>Total des lignes:</span>
                                <span className={styles.value}>{fileStats.total}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.label}>Lignes de code:</span>
                                <span className={styles.value}>{fileStats.code}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.label}>Commentaires:</span>
                                <span className={styles.value}>{fileStats.comments}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.label}>Lignes vides:</span>
                                <span className={styles.value}>{fileStats.empty}</span>
                            </div>
                        </div>

                        <div className={styles.distribution}>
                            <h4>📈 Répartition</h4>
                            <div className={styles.progressBar}>
                                <div className={styles.barLabel}>Code</div>
                                <div className={styles.barContainer}>
                                    <div 
                                        className={`${styles.bar} ${styles.codeBar}`}
                                        style={{ width: `${(fileStats.code / fileStats.total * 100).toFixed(1)}%` }}
                                    ></div>
                                </div>
                                <div className={styles.barValue}>{(fileStats.code / fileStats.total * 100).toFixed(1)}%</div>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.barLabel}>Commentaires</div>
                                <div className={styles.barContainer}>
                                    <div 
                                        className={`${styles.bar} ${styles.commentsBar}`}
                                        style={{ width: `${(fileStats.comments / fileStats.total * 100).toFixed(1)}%` }}
                                    ></div>
                                </div>
                                <div className={styles.barValue}>{(fileStats.comments / fileStats.total * 100).toFixed(1)}%</div>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.barLabel}>Vide</div>
                                <div className={styles.barContainer}>
                                    <div 
                                        className={`${styles.bar} ${styles.emptyBar}`}
                                        style={{ width: `${(fileStats.empty / fileStats.total * 100).toFixed(1)}%` }}
                                    ></div>
                                </div>
                                <div className={styles.barValue}>{(fileStats.empty / fileStats.total * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 