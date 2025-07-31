import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Link to="/">
        <img className={styles.logo} src="/logo.png" alt="KI-Logo" />
      </Link>
      <div className={styles.header}>
        <Link to="/Informationen">
          <button>Informationen</button>
        </Link>
        <Link to="/KIModelle">
          <button>KI-Modelle</button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
