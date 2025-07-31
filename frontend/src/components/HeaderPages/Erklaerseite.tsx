import React, { useState } from "react";
import styles from "./HeaderPages.module.css";

const INFOS = [
  {
    name: "KI",
    description:
      "KI steht für Künstliche Intelligenz. Das sind Computerprogramme, die so programmiert wurden, dass sie 'denken' und Aufgaben lösen können – zum Beispiel Texte schreiben, Bilder erkennen oder Fragen beantworten. Sie lernen oft aus Beispielen und Erfahrungen.",
  },
  {
    name: "Schreibassistent",
    description:
      "Ein Schreibassistent ist ein Computerprogramm, das beim Schreiben hilft. Er kann zum Beispiel Grammatik prüfen, Vorschläge machen oder ganze Texte vorschlagen. Oft benutzt er KI, um besonders hilfreiche Tipps zu geben.",
  },
  {
    name: "LLM (Large Language Model)",
    description:
      "LLM heißt übersetzt 'Großes Sprachmodell'. Das ist eine besondere Art von KI, die darauf trainiert wurde, menschliche Sprache zu verstehen und zu erzeugen. Sie kann aus vielen Texten lernen, um passende Antworten zu geben oder neue Texte zu schreiben.",
  },
  {
    name: "Ollama",
    description:
      "Ollama ist ein Programm, mit dem man Sprachmodelle (wie LLMs) auf dem eigenen Computer nutzen kann. So kannst du einen Schreibassistenten lokal, also ohne Internet, verwenden. Das hilft dabei, deine Daten privat zu halten.",
  },
  {
    name: "Kontext (Kontextfenster)",
    description:
      "Kontext bedeutet hier: Was das KI-Modell gerade weiß, um zu antworten. Das Kontextfenster bestimmt, wie viele Wörter oder Sätze sich das Modell 'merken' kann, wenn es eine Antwort gibt. Ist das Fenster zu klein, vergisst die KI ältere Teile des Gesprächs.",
  },
  {
    name: "Prompt",
    description:
      "Ein Prompt ist der Text oder die Frage, die du dem KI-Modell gibst. Darauf reagiert das Modell und versucht, die beste Antwort oder Lösung zu finden.",
  },
  {
    name: "Token",
    description:
      "Ein Token ist ein kleiner Teil eines Textes – das kann ein Wort oder sogar nur ein Stück davon sein. KI-Modelle rechnen ihre Texte in Tokens um. Wie viele Tokens ein Modell nutzen kann, bestimmt, wie viel Kontext möglich ist.",
  },
  {
    name: "Lokal",
    description:
      "Lokal bedeutet, dass ein Programm direkt auf deinem eigenen Computer läuft – nicht in der Cloud oder auf fremden Servern. So bleiben alle Daten bei dir.",
  },
  {
    name: "Trainieren",
    description:
      "Ein KI-Modell wird trainiert, indem es viele Beispiele bekommt. Daraus lernt es, wie Sprache funktioniert, und kann dann selbst Texte generieren oder Fragen beantworten.",
  },
];

export const Erklaerseite: React.FC = () => {
  const [expandedIndex1, setExpandedIndex1] = useState<number | null>(null);

  const handleExpand1 = (i: number) => {
    setExpandedIndex1(expandedIndex1 === i ? null : i);
  };

  return (
    <div className={styles.scrollable}>
      <h2>Informationen</h2>
      <div className={styles.modelList}>
        {INFOS.map((m, i) => (
          <div
            key={m.name}
            className={`${styles.modelCard} ${
              expandedIndex1 === i ? styles.active : ""
            }`}
            onClick={() => handleExpand1(i)}
            tabIndex={0}
          >
            <div className={styles.modelName}>{m.name}</div>
            {expandedIndex1 === i && (
              <div className={styles.modelDescription}>{m.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Erklaerseite;
