export const InfoPopUp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <>
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.15)",
        zIndex: 9000,
      }}
      onClick={onClose}
    />
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#e32",
          borderRadius: 8,
          padding: 24,
          minWidth: 320,
          textAlign: "center",
          boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: "none",
            background: "transparent",
            fontSize: 24,
            cursor: "pointer",
          }}
          aria-label="close"
        >
          &times;
        </button>
        <h2>Warnung</h2>
        <p>
          Wenn du AI benutzt, kann sie haluzinieren und müll labern, überprüfe
          alle infos die es dir gibt, aber nicht mit google, weil google ist
          müll.
        </p>
      </div>
    </div>
  </>
);
