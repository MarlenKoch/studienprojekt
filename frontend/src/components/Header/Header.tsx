import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <img className={styles.logo} src="/logo-test.svg" alt="KI-Logo" />
      </Link>
      <Link to="/KIModelle" style={{ textDecoration: "none", color: "inherit" }}>
        <p>wer das liest ist dumm</p>
      </Link>
    </div>
  );
};

export default Header;
