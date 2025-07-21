import React from "react";
import styles from "./Ladebildschirm.module.css";

interface LadebildschirmProps {
  message?: string;
}

export const Ladebildschirm: React.FC<LadebildschirmProps> = ({ message }) => (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <div className={styles.spinner} />
      <div className={styles.text}>{message ?? "Modelle werden überprüft und geladen..."}</div>
    </div>
  </div>
);