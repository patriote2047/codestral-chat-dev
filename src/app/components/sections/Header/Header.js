'use client';

import React from 'react';
import styles from './Header.module.css';
import ThemeSelector from './ThemeSelector/ThemeSelector';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.logo}>Codyman</h1>
                <nav className={styles.nav}>
                    <a href="/" className={`${styles.navLink} ${styles.active}`}>
                        Accueil
                    </a>
                    <a href="/documentation" className={styles.navLink}>
                        Documentation
                    </a>
                    <a href="/a-propos" className={styles.navLink}>
                        À propos
                    </a>
                </nav>
            </div>
            <div className={styles.headerRight}>
                <ThemeSelector />
            </div>
        </header>
    );
};

export default Header;
