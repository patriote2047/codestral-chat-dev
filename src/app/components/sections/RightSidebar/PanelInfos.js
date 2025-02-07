'use client';

import React from 'react';
import styles from './RightSidebar.module.css';
import clsx from 'clsx';

const PanelInfos = ({ isVisible, onClose }) => {
    const info = {
        duration: '2h15m',
        messages: '23 échanges',
        mode: 'Standard',
        avgTime: '45s',
        successRate: '95%'
    };

    return (
        <div className={clsx(styles.panelInfos, isVisible && styles.panelInfosVisible)}>
            <button 
                className={styles.expandButton}
                onClick={onClose}
                aria-label={isVisible ? "Masquer les informations" : "Afficher les informations"}
            >
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path
                        fill="currentColor"
                        d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
                    />
                </svg>
            </button>
            <div className={styles.infoContent}>
                <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>Session</h4>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Durée</span>
                        <span className={styles.infoValue}>{info.duration}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Messages</span>
                        <span className={styles.infoValue}>{info.messages}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Mode</span>
                        <span className={styles.infoValue}>{info.mode}</span>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>Statistiques</h4>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Temps moyen</span>
                        <span className={styles.infoValue}>{info.avgTime}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Taux de réussite</span>
                        <span className={styles.infoValue}>{info.successRate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PanelInfos; 