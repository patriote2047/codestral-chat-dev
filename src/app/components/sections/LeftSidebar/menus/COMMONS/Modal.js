'use client';

import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ 
    isOpen, 
    onClose, 
    title,
    command,
    scriptName,
    size = "medium",
    closeOnOverlayClick = true,
    children
}) {
    if (!isOpen) return null;

    return (
        <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
                if (e.target === e.currentTarget && closeOnOverlayClick) {
                    onClose();
                }
            }}
        >
            <div className={`${styles.modal} ${styles[size]}`}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button 
                        onClick={onClose}
                        className={styles.closeButton}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.modalContent}>
                    {children}
                </div>
            </div>
        </div>
    );
} 