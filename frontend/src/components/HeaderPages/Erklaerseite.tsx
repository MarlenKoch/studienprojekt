import React, { useState } from "react";
import styles from "./HeaderPages.module.css";

const INFOS = [
  {
    name: "KI",
    description: "KI",
  },
  {
    name: "Kontext",
    description: "Kontext",
  },
  {
    name: "weitere infos",
    description: "eo eo",
  },
];

export const Erklaerseite: React.FC = () => {
  const [expandedIndex1, setExpandedIndex1] = useState<number | null>(null);

  const handleExpand1 = (i: number) => {
    setExpandedIndex1(expandedIndex1 === i ? null : i);
  };

  return (
    <div className={styles.scrollable}>
      <h2>Informationen</h2>
      <div className={styles.modelList}>
        {INFOS.map((m, i) => (
          <div
            key={m.name}
            className={`${styles.modelCard} ${
              expandedIndex1 === i ? styles.active : ""
            }`}
            onClick={() => handleExpand1(i)}
            tabIndex={0}
          >
            <div className={styles.modelName}>{m.name}</div>
            {expandedIndex1 === i && (
              <div className={styles.modelDescription}>{m.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Erklaerseite;
