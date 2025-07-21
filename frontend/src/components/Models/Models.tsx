import React, { useState } from "react";
import axios from "axios";
// import styles from "./Models.module.css";
import { Ladebildschirm } from "../Ladebildschirm/Ladebildschirm";
import { toast } from "react-toastify";


const MODELS = [
    {
        name: "Gemma3",
        description:
            "Gemma3 ist ein leistungsfähiges KI-Sprachmodell mit Fokus auf umfangreiche Textverarbeitung und Vielseitigkeit.",
    },
    {
        name: "openeurollm-jobautomation",
        description:
            "OpenEuRollm Jobautomation unterstützt bei der Automatisierung von Aufgaben und Prozessen mithilfe künstlicher Intelligenz.",
    },
    {
        name: "wiederchat",
        description:
            "Wiederchat ist spezialisiert auf dialogorientierte Aufgaben und ermöglicht fortgeschrittene Chatbot-Anwendungen.",
    },
];

export const Models: React.FC = () => {
    const [modelName, setModelName] = useState("");
    const [ladeBildschirm, setLadeBildschirm] = useState(false);


    const handlePull = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!modelName.trim()) {
        toast.warn("Gib einen gültigen Namen ein");
        return;
    }
    setLadeBildschirm(true);
    try {
        await axios.post("http://localhost:8000/pullAiModel", { model_name: modelName });
        setLadeBildschirm(false);  
        toast.success("Modell erfolgreich geladen!");
    } catch (err: any) {
        console.log("In den Schuppen regnets rein")
        setLadeBildschirm(false);  
        toast.error("Fehler beim Laden des Modells. Ist der Modellname korrekt?");
    }
};


    return (
        <div>
            {ladeBildschirm && (
                <Ladebildschirm message="Das KI-Modell wird geladen, dies kann einige Zeit dauern" />
            )}
            <div>
                <h1>KI-Modell herunterladen</h1>
                <form onSubmit={handlePull}>
                    <label htmlFor="modelInput" >
                        Modellname eingeben:
                    </label>
                    <input
                        id="modelInput"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="z.B.: mistral"
                    />
                    <button type="submit" >
                        Modell herunterladen
                    </button>
                </form>

                <div >
                    <h2>Empfohlene Modelle</h2>
                    {MODELS.map((m) => (
                        <div key={m.name} >
                            <div >{m.name}</div>
                            <div >{m.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Models;