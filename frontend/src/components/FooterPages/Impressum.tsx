import React from "react";
import styles from "./FooterPages.module.css"


const Impressum: React.FC = () => (
  <main className={styles.nonScrollable}>
    <h1>Impressum</h1>
    <p>
      <strong>Projekt:</strong> Schreibassistent mit Künstlicher Intelligenz<br />
      <strong>Entwickelt im Rahmen eines Studienprojekts an der Hochschule für Wirtschaft und Recht Berlin</strong>
    </p>
    <h2>Verantwortlich</h2>
    <p>
      Amélie Hoffmann<br />
      Marlen Koch<br />
      Hochschule für Wirtschaft und Recht Berlin<br />

      E-Mail: s_kochl23@stud.hwr-berlin.de
    </p>
    <h2>Hinweis</h2>
    <p>
      Dieses Webangebot dient ausschließlich wissenschaftlichen und nichtkommerziellen Zwecken im Rahmen eines Hochschulprojekts.
      <br />
      Es besteht keine Gewähr auf inhaltliche Richtigkeit, Aktualität und Vollständigkeit.
      <br />
      Bei Fragen oder Hinweisen wenden Sie sich bitte an die oben angegebene Kontaktadresse.
    </p>
  </main>
);

export default Impressum;