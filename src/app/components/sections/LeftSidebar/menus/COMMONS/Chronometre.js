'use client';

import React, { useState } from 'react';
import styles from './Commons.module.css';
import ChronometreModal from './chronometre-modal';

const AVAILABLE_COMMANDS = [
    {
        name: 'Minuteur simple',
        description: 'Lance un minuteur qui s\'arrête après la durée spécifiée',
        needsMessage: false
    },
    {
        name: 'Minuteur avec message',
        description: 'Lance un minuteur qui affiche un message personnalisé à la fin',
        needsMessage: true
    }
];

export default function Chronometre() {
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
                Chronomètre
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

            <ChronometreModal 
                isOpen={selectedCommand !== null}
                onClose={handleCloseModal}
                title={selectedCommand?.name || 'Chronomètre'}
                command={selectedCommand}
                scriptName="chronometre.mjs"
            />
        </div>
    );
} 