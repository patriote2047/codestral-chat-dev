'use client';

import React, { useState } from 'react';
import styles from './Commons.module.css';
import CountLinesModal from './countlines-modal';

export default function CountLines() {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)} 
                className={styles.scriptButton}
            >
                Compter les lignes
            </button>

            <CountLinesModal 
                isOpen={isOpen}
                onClose={handleClose}
                title="Compteur de lignes"
                scriptName="count-lines.mjs"
            />
        </>
    );
} 