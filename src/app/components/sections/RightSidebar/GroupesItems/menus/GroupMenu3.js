'use client';

import React from 'react';
import styles from '../styles.module.css';
import { MENU_ITEMS } from './GroupMenu3/constants';


const GroupMenu3 = ({ isActive, onItemClick, activeItemId, expandedItem, onExpand }) => {
    const handleItemClick = (itemId, e) => {
        e.stopPropagation();
        onExpand(expandedItem === itemId ? null : itemId);

    };

    const handleSubItemClick = (itemId, subItemId, e) => {
        e.stopPropagation();
        onItemClick(1, subItemId, e);
    };

    return (
        <div className={styles.groupContainer}>
            <button className={styles.groupButton}>
                menu 3
            </button>
            <div className={styles.itemsList}>

                {MENU_ITEMS.map(item => (
                    <div key={item.id} className={styles.itemContainer}>
                        <button
                            className={`${styles.itemButton} ${expandedItem === item.id ? styles.expanded : ''}`}
                            onClick={(e) => handleItemClick(item.id, e)}
                        >
                            {item.name}
                        </button>
                        {expandedItem === item.id && (
                            <div className={styles.subItemsList}>
                                {item.subItems.map(subItem => (
                                    <button
                                        key={subItem.id}
                                        className={`${styles.subItemButton} ${activeItemId === subItem.id ? styles.active : ''}`}
                                        onClick={(e) => handleSubItemClick(item.id, subItem.id, e)}
                                    >
                                        {subItem.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupMenu3; 