import React from "react";
import styles from "./InfoPopUp.module.css";

export const InfoPopUp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className={styles.infoPopBackdrop} onClick={onClose}>
    <div
      className={styles.infoPopBox}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h2>Warnung</h2>
      <p>
        Wenn du AI benutzt, kann sie halluzinieren und müll labern, überprüfe
        alle infos die es dir gibt, aber nicht mit google, weil google ist müll.
      </p>
    </div>
  </div>
);
