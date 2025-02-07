'use client';

import React, { useState } from 'react';
import styles from './Preview.module.css';
import CountLinesPreview from './CountLinesPreview';

const AVAILABLE_TABS = [
    {
        id: 'count-lines',
        label: 'Compteur de lignes',
        component: CountLinesPreview
    }
    // D'autres onglets seront ajoutés ici
];

export default function Preview() {
    const [activeTab, setActiveTab] = useState(AVAILABLE_TABS[0].id);

    const ActiveComponent = AVAILABLE_TABS.find(tab => tab.id === activeTab)?.component;

    return (
        <div className={styles.previewContainer}>
            <div className={styles.tabs}>
                {AVAILABLE_TABS.map(tab => (
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
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
} 