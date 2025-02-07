'use client';

import React, { useState } from 'react';
import styles from './Commons.module.css';
import ShowTimeModal from './showtime-modal';

const AVAILABLE_COMMANDS = [
    {
        name: 'Heure simple',
        command: '--short',
        description: 'Affiche l\'heure au format court'
    },
    {
        name: 'Heure complète',
        command: '--seconds',
        description: 'Affiche l\'heure avec les secondes'
    }
];

export default function ShowTime() {
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuItemClick = (command) => {
        setSelectedCommand(command);
        setIsMenuOpen(false);
    };

    const handleCloseModal = () => {
        setSelectedCommand(null);
    };

    return (
        <div className={`${styles.menuContainer} ${isMenuOpen ? styles.menuActive : ''}`}>
            <button 
                className={styles.scriptButton}
                onClick={handleMenuClick}
            >
                Afficher l'heure
            </button>
            <ul className={styles.submenu}>
                {AVAILABLE_COMMANDS.map((cmd, index) => (
                    <li key={index} className={styles.submenuItem}>
                        <button
                            className={styles.submenuButton}
                            onClick={() => handleMenuItemClick(cmd)}
                        >
                            <h4>{cmd.name}</h4>
                            <p>{cmd.description}</p>
                        </button>
                    </li>
                ))}
            </ul>

            <ShowTimeModal 
                isOpen={selectedCommand !== null}
                onClose={handleCloseModal}
                title={selectedCommand?.name || 'Afficher l\'heure'}
                command={selectedCommand}
                scriptName="show-time.mjs"
            />

            <div className={styles.explanation}>
                <p>L&apos;heure actuelle sera affichée au format choisi.</p>
            </div>
        </div>
    );
} 