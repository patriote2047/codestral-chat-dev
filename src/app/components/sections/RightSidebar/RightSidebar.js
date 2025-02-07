'use client';

import React, { useState } from 'react';
import styles from './RightSidebar.module.css';

const RightSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <button
                className={styles.toggleButton}
                onClick={toggleSidebar}
                aria-label={isCollapsed ? 'Ouvrir le panneau' : 'Fermer le panneau'}
            >
                <svg className={styles.toggleIcon} viewBox="0 0 24 24" width="24" height="24">
                    <path
                        fill="currentColor"
                        d={
                            isCollapsed
                                ? 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'
                                : 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'
                        }
                    />
                </svg>
            </button>
            <div className={styles.sidebarContent}>
                <nav className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24" width="24" height="24">
                            <path
                                fill="currentColor"
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                            />
                        </svg>
                        <span className={styles.tabText}>Infos</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`}
                        onClick={() => setActiveTab('files')}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24" width="24" height="24">
                            <path
                                fill="currentColor"
                                d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 1.99 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                            />
                        </svg>
                        <span className={styles.tabText}>Fichiers</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'links' ? styles.active : ''}`}
                        onClick={() => setActiveTab('links')}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24" width="24" height="24">
                            <path
                                fill="currentColor"
                                d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
                            />
                        </svg>
                        <span className={styles.tabText}>Liens</span>
                    </button>
                </nav>

                <div className={styles.tabContent}>
                    {activeTab === 'info' && (
                        <div className={styles.infoPanel}>
                            <h3 className={styles.panelTitle}>Informations</h3>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Session</span>
                                <span className={styles.infoValue}>Active - 2h15m</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Messages</span>
                                <span className={styles.infoValue}>23 échanges</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Mode</span>
                                <span className={styles.infoValue}>Standard</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className={styles.filesPanel}>
                            <h3 className={styles.panelTitle}>Fichiers Partagés</h3>
                            <div className={styles.filesList}>
                                <div className={styles.fileItem}>
                                    <svg
                                        className={styles.fileIcon}
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2z"
                                        />
                                    </svg>
                                    <span className={styles.fileName}>document.txt</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className={styles.linksPanel}>
                            <h3 className={styles.panelTitle}>Liens Utiles</h3>
                            <div className={styles.linksList}>
                                <a href="#" className={styles.linkItem}>
                                    <svg
                                        className={styles.linkIcon}
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                                        />
                                    </svg>
                                    <span className={styles.linkText}>Documentation</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
