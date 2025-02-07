'use client';

import React from 'react';
import styles from './Main.module.css';
import Preview from './preview/Preview';
import ChatComponent from '../Codestral/ChatComponent';

export default function Main() {
    return (
        <main className={styles.main}>
            <div className={styles.contentWrapper}>
                <div className={styles.chatContainer}>
                    <ChatComponent />
                </div>
                <Preview />
            </div>
        </main>
    );
}
