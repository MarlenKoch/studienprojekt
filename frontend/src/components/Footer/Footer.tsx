import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <ul className={styles.footerLinks}>
        <Link to="/impressum" className="white-link">
          Impressum
        </Link>
        <Link to="/" className="white-link">
          Warum Pizza toll ist
        </Link>
        <Link to="/ueberUns" className="white-link">
          Über uns
        </Link>
      </ul>
    </footer>
  );
};

export default Footer;