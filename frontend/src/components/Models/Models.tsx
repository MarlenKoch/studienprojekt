import React, { useState } from "react";
import axios from "axios";
import styles from "./Models.module.css";
import { Ladebildschirm } from "../Ladebildschirm/Ladebildschirm";
import { toast } from "react-toastify";
import InfoTip from "../InfoTip/InfoTip";

const MODELS1 = [
  {
    name: "Gemma3",
    description:
      "Gemma3 ist ein von Google entwickeltes Open Source KI-Modell, welches aufgrund seiner Architektur auch auf Laptops performant läuf.",
  },
  {
    name: "jobautomation/OpenEuroLLM-German",
    description:
      "jobautomation/OpenEuroLLM-German ist eine für deutschsprachige Antworten optimierte Version von Gemma 3, welche trainiert wurde, grammatikalisch korrekte Antworten ohne fremdsprachige Fachwörter zu geben.",
  },
  {
    name: "mayflowergmbh/wiederchat",
    description:
      "Wiederchat ist die Kombination aus mehreren auf Mistral-basierenden KI-Modellen und ebenfalls auf die deutsche Sprache abgestimmt.",
  },
];

const MODELS2 = [
  {
    name: "deepseek-r1",
    description:
      "Deepseek-r1 ist eine Familie von frei verfügbaren Open-Source-Sprachmodellen mit besonders starken Fähigkeiten im logischen Denken und Problemlösen. Um sie zu installieren gib 'deepseek-r1:7b' in das Eingabefeld ein.",
  },
  {
    name: "Llama 3.2",
    description:
      "Llama 3.2 sind kleine, mehrsprachige Open-Source-Sprachmodelle, die besonders für Dialog, Zusammenfassungen und Wissensabfragen optimiert sind. Nutze 'llama3.2:latest' zum installieren.",
  },
  {
    name: "mistral",
    description:
      "Mistral ist ein Open-Source-Sprachmodell von Mistral AI, das für Textgenerierung und Instruktionsverarbeitung optimiert ist. Du kannst es dir mit 'mistral:latest' installieren. ",
  },
];

export const Models: React.FC = () => {
  const [modelName, setModelName] = useState("");
  const [ladeBildschirm, setLadeBildschirm] = useState(false);
  const [expandedIndex1, setExpandedIndex1] = useState<number | null>(null);
  const [expandedIndex2, setExpandedIndex2] = useState<number | null>(null);

  const handlePull = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!modelName.trim()) {
      toast.warn("Gib einen gültigen Namen ein");
      return;
    }
    setLadeBildschirm(true);
    try {
      await axios.post("http://localhost:8000/pullAiModel", {
        model_name: modelName,
      });
      setLadeBildschirm(false);
      toast.success("Modell erfolgreich geladen!");
    } catch (err) {
      console.log(err);
      setLadeBildschirm(false);
      toast.error("Fehler beim Laden des Modells. Ist der Modellname korrekt?");
    }
  };
  const handleExpand1 = (i: number) => {
    setExpandedIndex1(expandedIndex1 === i ? null : i);
  };
  const handleExpand2 = (i: number) => {
    setExpandedIndex2(expandedIndex2 === i ? null : i);
  };

  return (
    <div className={styles.scrollable}>
      {ladeBildschirm && (
        <Ladebildschirm message="Das KI-Modell wird geladen, dies kann einige Zeit dauern" />
      )}

      <div>
        <form onSubmit={handlePull} className={styles.formGroup}>
          <input
            id="modelInput"
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className={styles.inputBox}
            placeholder="Modellname eingeben"
            autoComplete="off"
          />
          <InfoTip
            top={true}
            text="Das Modell wird über die Ollama API auf deinem Gerät installiert und steht dann lokal zur Verfügung. Je nach Größe des Modells kann das Herunterladen eine Weile dauern. Eine Übersicht unterschiedlicher Modelle findest du auch auf der offiziellen Ollama Seite."
          >
            <button
            // className={styles.Btn}
            >
              Modell herunterladen
            </button>
          </InfoTip>
        </form>
      </div>

      <h2>Bereits installierte Modelle</h2>
      <div className={styles.modelList}>
        {MODELS1.map((m, i) => (
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

            <div>
                <form onSubmit={handlePull} className={styles.formGroup}>
                    <input
                        id="modelInput"
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className={styles.inputBox}
                        placeholder="Modellname eingeben"
                        autoComplete="off"
                    />
                    <InfoTip text="Das Modell wird über die Ollama API auf deinem Gerät installiert und steht dann lokal zur Verfügung. Je nach Größe des Modells kann das Herunterladen eine Weile dauern. Eine Übersicht unterschiedlicher Modelle findest du auch auf der offiziellen Ollama Seite.">
                    <button type="submit">
                        Modell herunterladen
                    </button>
                    </InfoTip>
                </form>
            </div>

            <h2>vorinstallierte Modelle</h2>
            <div className={styles.modelList}>
                {MODELS1.map((m, i) => (
                    <div
                        key={m.name}
                        className={`${styles.modelCard} ${expandedIndex1 === i ? styles.active : ""}`}
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
            <h2>Weitere Modelle</h2>
            <div className={styles.modelList}>
                {MODELS2.map((m, i) => (
                    <div
                        key={m.name}
                        className={`${styles.modelCard} ${expandedIndex2 === i ? styles.active : ""}`}
                        onClick={() => handleExpand2(i)}
                        tabIndex={0}
                    >
                        <div className={styles.modelName}>{m.name}</div>
                        {expandedIndex2 === i && (
                            <div className={styles.modelDescription}>{m.description}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Models;
