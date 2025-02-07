'use client';

import React from 'react';
import styles from './RightSidebar.module.css';

const GroupesItems = () => {
    const sessionInfo = {
        duration: '2h15m',
        messages: '23 échanges',
        mode: 'Standard'
    };

    return (
        <div className={styles.groupesItems}>
            <div className={styles.previewContent}>
                <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>Session</span>
                    <span className={styles.previewValue}>{sessionInfo.duration}</span>
                </div>
                <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>Messages</span>
                    <span className={styles.previewValue}>{sessionInfo.messages}</span>
                </div>
                <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>Mode</span>
                    <span className={styles.previewValue}>{sessionInfo.mode}</span>
                </div>
            </div>
        </div>
    );
};

export default GroupesItems; 