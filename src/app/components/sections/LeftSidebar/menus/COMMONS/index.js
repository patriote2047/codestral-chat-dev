'use client';

import React from 'react';
import styles from './Commons.module.css';
import Chronometre from './Chronometre';
import ShowTime from './ShowTime';
import CountLines from './CountLines';

export default function CommonsMenu() {
    return (
        <div className={styles.menu}>
            <h3 className={styles.menuTitle}>COMMONS</h3>
            <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                    <Chronometre />
                </li>
                <li className={styles.menuSeparator}>|</li>
                <li className={styles.menuItem}>
                    <ShowTime />
                </li>
                <li className={styles.menuSeparator}>|</li>
                <li className={styles.menuItem}>
                    <CountLines />
                </li>
            </ul>
        </div>
    );
} 