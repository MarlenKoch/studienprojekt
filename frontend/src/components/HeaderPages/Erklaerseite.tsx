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
    name: "Lokal",
    description:
      "Lokal bedeutet, dass ein Programm direkt auf deinem eigenen Computer läuft – nicht in der Cloud oder auf fremden Servern. So bleiben alle Daten bei dir. Aus Datenschutzgründen laufen deswegen auch die verwendeten KI-Modelle auf deinem Rechner.",
  },
  {
    name: "Vordefinierte Prompts",
    description:
      "Wählst du eine der vorgegebenen Aufgaben, wird dem KI-Modell aus dem Backend ein Prompt mitgegeben. Der sagt dem Modell, welche Aufgabe es lösen und in welchem Format es antworten soll.",
  },
  {
    name: "Vorinstallierte KI-Modelle",
    description:
      "Die Modelle Gemma3, jobautomation/OpenEuroLLM-German und mayflowergmbh/wiederchat lieferten bei Tests die besten Antworten für die vordefinierten Aufgaben und werden daher als Standard verwendet.",
  },
  {
    name: "Wie nutzt die KI meinen Text?",
    description:
      "Erstellst du zu einem Absatz einen KI-Chat, wird der Inhalt des Absatzes bei jeder Anfrage als Zusatzinformation an die KI gegeben. Hast du jedoch bereits mehrere Texte im Chatverlauf, beachtet das KI-Modell eher diese Texte als den Inhalt deines Absatzes. Soll die KI also unbedingt auf den Inhalt deines Absatzes eingehen, erstelle einen neuen Chat zu diesem Absatz.",
  },
  {
    name: "Wieso kann ich Kommentare “aktivieren”?",
    description:
      "Das Aktivieren von Kommentaren bedeutet, dass du diese dem KI-Modell bei der nächsten Anfrage ebenfalls als Kontextinformation mitgibst.",
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
