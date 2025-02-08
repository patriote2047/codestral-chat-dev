'use client';

import React, { useState } from 'react';
import styles from './Preview.module.css';

const CommandsPreview = ({ data, isVisible }) => {
    const [activeTab, setActiveTab] = useState('commands');

    if (!isVisible) return null;

    const tabs = [
        { id: 'commands', label: 'Commandes' },
        { id: 'output', label: 'Sortie' },
        { id: 'logs', label: 'Logs' }
    ];

    if (!data) {
        return (
            <div className={`${styles.previewContainer} ${styles.visible}`}>
                <div className={styles.placeholder}>
                    Sélectionnez une commande pour voir son résultat
                </div>
            </div>
        );
    }

    if (data.type === 'error') {
        return (
            <div className={`${styles.previewContainer} ${styles.visible}`}>
                <div className={styles.error}>
                    {data.content}
                </div>
            </div>
        );
    }

    const renderCommandLine = (line) => {
        // Gestion des différents types de lignes
        if (line.type === 'category') {
            return (
                <div className={`${styles.line} ${styles.category}`}>
                    {line.icon} {line.text}
                </div>
            );
        }

        if (line.type === 'command') {
            return (
                <div className={`${styles.line} ${styles.command}`}>
                    <span className={styles.commandName}>{line.name}</span>
                    <span className={styles.commandDesc}>{line.description}</span>
                </div>
            );
        }

        if (line.type === 'subCommand') {
            return (
                <div className={`${styles.line} ${styles.subCommand}`}>
                    <span className={styles.arrow}>↳</span>
                    {line.commands.map((cmd, i) => (
                        <React.Fragment key={i}>
                            <span className={styles.subCommandName}>{cmd}</span>
                            {i < line.commands.length - 1 && (
                                <span className={styles.plus}>+</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            );
        }

        if (line.type === 'separator') {
            return <div className={styles.separator} />;
        }

        // Ligne simple par défaut
        return <div className={styles.line}>{line.text}</div>;
    };

    return (
        <div className={`${styles.previewContainer} ${styles.visible}`}>
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.previewContent}>
                {!data ? (
                    <div className={styles.placeholder}>
                        Sélectionnez une commande pour voir son résultat
                    </div>
                ) : data.type === 'error' ? (
                    <div className={styles.error}>
                        {data.content}
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <h2>{data.title}</h2>
                            {data.subtitle && <p>{data.subtitle}</p>}
                        </div>
                        
                        <div className={styles.content}>
                            {data.content.map((line, index) => (
                                <React.Fragment key={index}>
                                    {renderCommandLine(line)}
                                </React.Fragment>
                            ))}
                        </div>

                        {data.metadata && (
                            <div className={styles.metadata}>
                                <p>Projet : {data.metadata.projectPath}</p>
                                <p>Exécuté le : {new Date(data.metadata.timestamp).toLocaleString()}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommandsPreview; 