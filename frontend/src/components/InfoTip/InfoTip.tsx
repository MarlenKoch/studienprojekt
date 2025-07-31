import React, { ReactNode, useRef, useState, useEffect } from "react";
import styles from "./InfoTip.module.css";

interface InfoTipProps {
  children: ReactNode;
  text: string;
  top?: boolean;
  left?: boolean;
}

const InfoTip: React.FC<InfoTipProps> = ({ children, text, top, left }) => {
  const [visible, setVisible] = useState(false);
  const iconRef = useRef<HTMLButtonElement | null>(null);

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

  return (
    <div className={styles.relativeContainer}>
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
        <div
          className={
            styles.bigInfoTipPopup +
            " " +
            (top ? styles.bigInfoTipPopupTop : styles.bigInfoTipPopupBottom) +
            " " +
            (left ? styles.bigInfoTipPopupLeft : styles.bigInfoTipPopupRight)
          }
        >
          <div className={styles.InfoTipText}>{text}</div>
        </div>
      )}
    </div>
  );
};

export default InfoTip;
