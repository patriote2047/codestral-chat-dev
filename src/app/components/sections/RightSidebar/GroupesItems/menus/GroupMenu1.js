'use client';

import React from 'react';
import styles from '../styles.module.css';

const GroupMenu1 = ({ isActive, onItemClick, activeItemId, expandedItem, onExpand }) => {
    const items = [
        { 
            id: 11, 
            name: 'COMMANDES',
            subItems: [
                { id: 111, name: 'COMMANDES SIMPLES' },
                { id: 112, name: 'TOUTES LES COMMANDES' },
                { id: 113, name: 'VOIR LES DECRIPTIONS' },
                { id: 114, name: 'AJOUTER UNE DESCRIPTION' }
            ]
        },
        { 
            id: 12, 
            name: 'DEPENDENCES',
            subItems: [
                { id: 121, name: 'SYNTAXE' },
                { id: 122, name: 'STRUCTURE' },
                { id: 123, name: 'ERREURS' }
            ]
        },
        { 
            id: 13, 
            name: 'FILES',
            subItems: [
                { id: 131, name: 'CONTENU' },
                { id: 132, name: 'METADATA' },
                { id: 133, name: 'LOGS' }
            ]
        },
        { 
            id: 14, 
            name: 'FOLDERS',
            subItems: [
                { id: 141, name: 'ARBORESCENCE' },
                { id: 142, name: 'RECHERCHE' },
                { id: 143, name: 'FILTRES' }
            ]
        },
        { 
            id: 15, 
            name: 'TESTS',
            subItems: [
                { id: 141, name: 'ARBORESCENCE' },
                { id: 142, name: 'RECHERCHE' },
                { id: 143, name: 'FILTRES' }
            ]
        }
    ];

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
                SCANNER
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

export default GroupMenu1; 