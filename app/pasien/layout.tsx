"use client";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import styles from "../../components/Sidebar.module.css";

export default function PasienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar role="pasien" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar />
        <main className={styles.mainContent} style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
