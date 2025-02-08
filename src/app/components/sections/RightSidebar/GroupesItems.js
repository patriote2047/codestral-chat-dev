'use client';

import React from 'react';
import GroupList from './GroupesItems/GroupList';
import styles from './GroupesItems/styles.module.css';

const GroupesItems = () => {
    return (
        <div className={styles.groupesItems}>
            <div className={styles.previewContent}>
                <GroupList />
            </div>
        </div>
    );
};

export default GroupesItems; 