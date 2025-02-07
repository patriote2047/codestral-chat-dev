'use client';

import React, { useState, useRef } from 'react';
import styles from './LeftSidebar.module.css';
import CommonsMenu from './menus/COMMONS';

// Liste des menus disponibles (correspondant aux dossiers en MAJUSCULES)
const AVAILABLE_MENUS = [
    'COMMONS',
    'SCANNER',
    'ANALYSER', 
    'LIRE',
    'RELIRE',
    'SURVEILLER',
    'COMPARE',
    'DECOMPOSER',
    'ECRIRE',
    'MCP',
    'NOTER',
    
];

export default function LeftSidebar() {
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0 });

    const handleMouseEnter = (e, menuName) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.top });
        setHoveredMenu(menuName);
    };

    return (
        <nav className={styles.sidebar}>
            <h2 className={styles.menuTitle}>Scripts disponibles</h2>
            <ul className={styles.navigation}>
                {AVAILABLE_MENUS.map((menuName) => (
                    <li 
                        key={menuName}
                        className={styles.menuItem}
                        onMouseEnter={(e) => handleMouseEnter(e, menuName)}
                        onMouseLeave={() => setHoveredMenu(null)}
                    >
                        <button className={styles.menuButton}>
                            {menuName}
                        </button>
                        {hoveredMenu === menuName && menuName === 'COMMONS' && (
                            <div className={styles.menuContent} style={{ top: menuPosition.top }}>
                                <CommonsMenu />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
