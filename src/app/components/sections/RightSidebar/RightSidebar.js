'use client';

import React, { useState } from 'react';
import styles from './RightSidebar.module.css';
import GroupesItems from './GroupesItems';
import PanelInfos from './PanelInfos';

const RightSidebar = () => {
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.panneaux}>
                <GroupesItems />
                <PanelInfos 
                    isVisible={isPanelVisible}
                    onClose={() => setIsPanelVisible(!isPanelVisible)}
                />
            </div>
        </aside>
    );
};

export default RightSidebar;
