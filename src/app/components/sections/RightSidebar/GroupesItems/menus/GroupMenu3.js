'use client';

import React, { useState } from 'react';
import styles from '../styles.module.css';

const GroupMenu3 = ({ isActive, onItemClick, activeItemId }) => {
    const [expandedItem, setExpandedItem] = useState(null);

    const items = [
        { 
            id: 31, 
            name: 'CONTROLE', 
            subItems: [
                { id: 311, name: 'DEMARRER' },
                { id: 312, name: 'ARRETER' },
                { id: 313, name: 'PAUSE' }
            ]
        },
        { 
            id: 32, 
            name: 'GESTION', 
            subItems: [
                { id: 321, name: 'AJOUTER' },
                { id: 322, name: 'SUPPRIMER' },
                { id: 323, name: 'MODIFIER' }
            ]
        },
        { 
            id: 33, 
            name: 'SYSTEME',
            subItems: [
                { id: 331, name: 'MISE A JOUR' },
                { id: 332, name: 'BACKUP' },
                { id: 333, name: 'RESTORE' }
            ]
        }
    ];

    const handleItemClick = (itemId, e) => {
        e.stopPropagation();
        setExpandedItem(expandedItem === itemId ? null : itemId);
    };

    const handleSubItemClick = (itemId, subItemId, e) => {
        e.stopPropagation();
        onItemClick(3, subItemId, e);
    };

    return (
        <div className={styles.groupContainer}>
            <button className={styles.groupButton}>
                MCP
            </button>
            <div className={styles.itemsList}>
                {items.map(item => (
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