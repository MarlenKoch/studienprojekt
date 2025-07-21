import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <img
          className={styles.logo}
          src="/logo.png"
          alt="KI-Logo"
          style={{
            transform: "rotate(90deg) scaleX(-1)",
          }}
        />
      </Link>
    </div>
  );
};

export default Header;
