'use client';

import React, { useState, useEffect } from 'react';
import styles from './Preview.module.css';

const Preview = () => {
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        const handlePreviewUpdate = (event) => {
            console.log('Données reçues dans Preview:', event.detail);
            setPreviewData(event.detail);
        };

        window.addEventListener('previewUpdate', handlePreviewUpdate);
        return () => {
            window.removeEventListener('previewUpdate', handlePreviewUpdate);
        };
    }, []);

    const renderContentItem = (item, index) => {
        if (item.html) {
            return (
                <div key={index} 
                     className={styles[item.type]} 
                     dangerouslySetInnerHTML={{ __html: item.html }} 
                />
            );
        }

        switch (item.type) {
            case 'text':
                return <div key={index} className={styles.text}>{item.text}</div>;
            
            case 'separator':
                return <div key={index} className={styles.separator} />;
            
            default:
                return <div key={index}>{JSON.stringify(item)}</div>;
        }
    };

    const renderContent = () => {
        if (!previewData) {
            return (
                <div className={styles.placeholder}>
                    Sélectionnez une option du menu pour voir son résultat
                </div>
            );
        }

        if (previewData.type === 'error') {
            return (
                <div className={styles.error}>
                    <h3>Erreur</h3>
                    <p>{previewData.content}</p>
                </div>
            );
        }

        return (
            <div className={styles.success}>
                {Array.isArray(previewData.content) 
                    ? previewData.content.map((item, index) => renderContentItem(item, index))
                    : <div className={styles.text}>{previewData.content}</div>
                }

                {previewData.metadata && (
                    <div className={styles.metadata}>
                        <p>Exécuté le : {new Date(previewData.metadata.timestamp).toLocaleString()}</p>
                        {Object.entries(previewData.metadata)
                            .filter(([key]) => key !== 'timestamp')
                            .map(([key, value]) => (
                                <p key={key}>{key}: {JSON.stringify(value)}</p>
                            ))
                        }
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.previewContainer}>
            <div className={styles.previewContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Preview; 