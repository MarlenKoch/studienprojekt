import React from "react";
import styles from "./FooterPages.module.css"

const Impressum: React.FC = () => {
  return (
    <div className={styles.nonScrollable}>
      <h1>Impressum</h1>
      <div style={{ fontWeight: "bold" }}>
        <p>
          Willkommen auf Crümbli, Ihrem neuen digitalen Kochbuch! Wir haben eine
          ganz tolle Website entwickelt, die es Ihnen ermöglicht, Ihre
          kulinarischen Kreationen optimal zu organisieren. Egal, ob Sie ein
          leidenschaftlicher Hobbykoch oder einfach nur auf der Suche nach Ihrem
          nächsten Lieblingsgericht sind - bei uns sind Sie genau richtig.{" "}
        </p>

      </div>
    </div>
  );
};

export default Impressum;