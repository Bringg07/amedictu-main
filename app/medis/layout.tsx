"use client";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import styles from "../../components/Sidebar.module.css";
import { usePathname } from "next/navigation";

export default function MedisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/medis/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar role="medis" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar />
        <main className={styles.mainContent} style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
