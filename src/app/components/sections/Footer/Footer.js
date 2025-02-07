'use client';

import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerLeft}>
                <span>&copy; 2024 Codyman</span>
                <a href="/legal" className={styles.footerLink}>
                    Mentions légales
                </a>
            </div>
            <div className={styles.footerRight}>
                <a href="/docs" className={styles.footerLink}>
                    Documentation
                </a>
                <a href="/support" className={styles.footerLink}>
                    Support
                </a>
            </div>
        </footer>
    );
};

export default Footer;
