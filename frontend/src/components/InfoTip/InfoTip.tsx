import React, { ReactNode, useRef, useState, useEffect } from "react";
import styles from "./InfoTip.module.css";

interface InfoTipProps {
  children: ReactNode;
  title?: string;
  text: string;
}

const InfoTip: React.FC<InfoTipProps> = ({ children, title, text }) => {
  const [visible, setVisible] = useState(false);
  const iconRef = useRef<HTMLButtonElement | null>(null);

  // Klick außerhalb schließt das Popup
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        visible &&
        iconRef.current &&
        !iconRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible]);

  // Das InfoTip wird jetzt direkt unter das i-Icon positioniert,
  // nicht mehr via Portal
  return (
    <span className={styles.relativeContainer}>
      {children}
      <button
        ref={iconRef}
        type="button"
        className={styles.infoIconBtn}
        aria-label="Info"
        onClick={() => setVisible((v) => !v)}
        tabIndex={0}
      >
        <span className={styles.circleI}>i</span>
      </button>
      {visible && (
        <div className={styles.bigInfoTipPopup}>
          {title && <div className={styles.InfoTipTitle}>{title}</div>}
          <div className={styles.InfoTipText}>{text}</div>
        </div>
      )}
    </span>
  );
};

export default InfoTip;
