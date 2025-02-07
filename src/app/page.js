'use client';

import styles from './page.module.css';
import Header from './components/sections/Header/Header';
import LeftSidebar from './components/sections/LeftSidebar/LeftSidebar';
import RightSidebar from './components/sections/RightSidebar/RightSidebar';
import Main from './components/sections/Main/Main';
import Footer from './components/sections/Footer/Footer';

export default function Home() {
    return (
        <div className={styles.container}>
            {/* Zone A : Header */}
            <div className={styles.zoneA}>
                <Header />
            </div>

            {/* Zone B : Content */}
            <div className={styles.zoneB}>
                <div className={styles.zoneBLeft}>
                    <LeftSidebar />
                </div>
                <div className={styles.zoneBMain}>
                    <Main />
                </div>
                <div className={styles.zoneBRight}>
                    <RightSidebar />
                </div>
            </div>

            {/* Zone C : Footer */}
            <div className={styles.zoneC}>
                <Footer />
            </div>
        </div>
    );
}
