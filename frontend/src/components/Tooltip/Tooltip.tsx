import React, { ReactNode, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  children: ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLSpanElement | null>(null);

  const showTooltip = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setVisible(true);
    }
  };

  const hideTooltip = () => setVisible(false);

  return (
    <>
      <span
        ref={childRef}
        className={styles.tooltipContainer}
        tabIndex={0}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      {visible &&
        ReactDOM.createPortal(
          <span
            className={styles.tooltipTextPortal}
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            <div className={styles.title}>{text}</div>
          </span>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
