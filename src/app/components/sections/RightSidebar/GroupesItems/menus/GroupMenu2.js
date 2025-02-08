'use client';

import React from 'react';
import styles from '../styles.module.css';

const GroupMenu2 = ({ isActive, onItemClick, activeItemId, expandedItem, onExpand }) => {
    const items = [
        { 
            id: 21, 
            name: 'CONFIG',
            subItems: [
                { id: 211, name: 'GENERAL' },
                { id: 212, name: 'AVANCE' },
                { id: 213, name: 'SECURITE' }
            ]
        },
        { 
            id: 22, 
            name: 'DOSSIER',
            subItems: [
                { id: 221, name: 'CREER' },
                { id: 222, name: 'DEPLACER' },
                { id: 223, name: 'COPIER' }
            ]
        },
        { 
            id: 23, 
            name: 'FICHIER',
            subItems: [
                { id: 231, name: 'NOUVEAU' },
                { id: 232, name: 'EDITER' },
                { id: 233, name: 'SUPPRIMER' }
            ]
        },
        { 
            id: 24, 
            name: 'FONCTIONS',
            subItems: [
                { id: 241, name: 'IMPORTER' },
                { id: 242, name: 'EXPORTER' },
                { id: 243, name: 'COMPILER' }
            ]
        }
    ];

    const handleItemClick = (itemId, e) => {
        e.stopPropagation();
        onExpand(expandedItem === itemId ? null : itemId);
    };

    const handleSubItemClick = (itemId, subItemId, e) => {
        e.stopPropagation();
        onItemClick(2, subItemId, e);
    };

    return (
        <div className={styles.groupContainer}>
            <button className={styles.groupButton}>
                LISTER
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

export default GroupMenu2; 