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
        Diese KI-Anwendung kann unter bestimmten Umständen sogenannte
        „Halluzinationen“ aufweisen. Eine KI-Halluzination ist die plausible,
        aber faktisch falsche oder erfundene Antwort einer künstlichen
        Intelligenz. Zum Beispiel könnte die KI auf die Frage nach einer
        wissenschaftlichen Studie eine Quelle nennen, die gar nicht existiert.
        Solche Fehlinformationen entstehen, weil KI-Modelle auf
        Wahrscheinlichkeiten der nächsten Wörter trainiert sind und dabei
        manchmal Informationen kombinieren, die zwar logisch erscheinen, aber
        inhaltlich falsch sind. Ursachen können u.a. unvollständige
        Trainingsdaten, missverstandene Kontextinformationen oder
        Mehrdeutigkeiten in der Benutzereingabe sein. Daher ist es wichtig,
        generierte Inhalte kritisch zu hinterfragen.
      </p>
    </div>
  </div>
);
