import React from "react";
import styles from "./FooterPages.module.css"

const DataSafetyInformation: React.FC = () => {
  return (
    <div className={styles.nonScrollable}>
      <h1>Schreibassistent – Projektübersicht</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Ziel des Projekts</h2>
        <p>
          Ziel ist es, einen fortschrittlichen Schreibassistenten zu entwickeln, der den Einsatz von künstlicher Intelligenz während des Schreibprozesses optimiert und somit die Effizienz und Effektivität des Schreibens steigert.
          <br />
          <strong>Das Projekt entsteht im Rahmen der Studienprojekte der Hochschule für Wirtschaft und Recht Berlin.</strong>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Technologien</h2>
        <ul>
          <li>
            <strong>Frontend</strong>
            <ul>
              <li>
                <b>React:</b> Für die Entwicklung der Benutzeroberfläche und interaktiver Elemente
              </li>
              <li>
                <b>TypeScript:</b> Typisierung zur Fehlervermeidung und besseren Wartbarkeit
              </li>
            </ul>
          </li>
          <li>
            <br />
            <strong>Backend</strong>
            <ul>
              <li>
                <b>Python FastAPI:</b> Entwicklung schneller und effizienter REST-APIs
              </li>
              <li>
                <b>SQLite:</b> Einfaches, schnelles Datenbankmanagement
              </li>
              <li>
                <b>SQLAlchemy:</b> ORM zur vereinfachten Datenbankverwaltung
              </li>
            </ul>
          </li>
          <li>
            <br />
            <strong>AI Modelle</strong>
            <ul>
              <li>
                <b>Ollama Modelle:</b> Lokale KI-Modelle für fortschrittliche Textverarbeitung
              </li>
            </ul>
          </li>
        </ul>
      </section>

    </div>
  );
};

export default DataSafetyInformation;