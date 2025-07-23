import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Link to="/">
        <img className={styles.logo} src="/logo.png" alt="KI-Logo" />
      </Link>
      <Link to="/KIModelle">
        <button>KI-Modelle</button>
      </Link>
    </div>
  );
};

export default Header;
