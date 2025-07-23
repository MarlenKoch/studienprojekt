import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Project } from "../../types/Project";
import { useProjectTimer } from "../../context/ProjectTimerContext";
import { toast } from "react-toastify";
import { InfoPopUp } from "../InfoPopUp/InfoPopUp";
import styles from "./Home.module.css";
import { Ladebildschirm } from "../Ladebildschirm/Ladebildschirm";
import Tooltip from "../Tooltip/Tooltip";

const modeLabel = (mode: number) => {
  switch (mode) {
    case 0:
      return "normaler Modus";
    case 1:
      return "Schülermodus";
    case 2:
      return "Arbeiten schreiben";
    case 3:
      return "abgegeben";
    default:
      return "unbekannt";
  }
};

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectMode, setNewProjectMode] = useState<number>(0);
  const [showInfoPopUp, setShowInfoPopUp] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [ladeBildschirm, setLadeBildschirm] = useState(false);

  const {
    currentProjectId,
    setCurrentProjectId,
    currentMode,
    setProjectMode,
    stopTimer,
  } = useProjectTimer();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get<Project[]>(
          "http://localhost:8000/projects"
        );
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const cleanUpContext = async () => {
      if (currentMode === 2) await setProjectMode(currentProjectId, 3);
      setCurrentProjectId(null);
      stopTimer();
    };
    fetchProjects();
    cleanUpContext();
  }, []);

  const handleAddProject = async () => {
    if (newProjectTitle.trim() === "") {
      toast.warn("Bitte fülle alle notwendigen Felder aus");
      return;
    }

    setLadeBildschirm(true);
    try {
      await axios.get("http://localhost:8000/requiredAiModels");
    } catch (error) {
      console.error("Error checking required AI models:", error);
      setLadeBildschirm(false);
      toast.warn(
        "Beim Laden der notwendigen Modelle ist ein Fehler aufgetreten."
      );
    }

    try {
      const newProject = {
        title: newProjectTitle,
        mode: newProjectMode,
      };

      const response = await axios.post<Project>(
        "http://localhost:8000/projects",
        newProject,
        { headers: { "Content-Type": "application/json" } }
      );

      setProjects([...projects, response.data]);
      setNewProjectTitle("");
      setNewProjectMode(0);
      setShowInfoPopUp(true);
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setLadeBildschirm(false);
  };

  return (
    <div>
      {ladeBildschirm && (
        <Ladebildschirm message="Die benötigten KI-Modelle werden geladen, dies kann einige Zeit dauern" />
      )}
      <div>
        {showInfoPopUp && <InfoPopUp onClose={() => setShowInfoPopUp(false)} />}
        <div className={styles.scrollableContainer}>
          <ul className={styles.projectGrid}>
            <li>
              {!addMode ? (
                <button
                  className={styles.projectBox}
                  onClick={() => setAddMode(true)}
                >
                  + Neues Projekt
                </button>
              ) : (
                <div className={`${styles.projectBox} ${styles.addProjectBox}`}>
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Projektname"
                    className={styles.addInput}
                  />
                  <select
                    value={newProjectMode}
                    onChange={(e) => setNewProjectMode(Number(e.target.value))}
                    className={styles.addSelect}
                  >
                    <option value={0}>normaler Modus</option>
                    <option value={1}>Schülermodus</option>
                    <option value={2}>Arbeiten schreiben</option>
                  </select>
                  <div className={styles.buttonRow}>
                    <button
                      onClick={handleAddProject}
                      className={styles.miniButton}
                    >
                      Erstellen
                    </button>
                    <button
                      onClick={() => setAddMode(false)}
                      className={styles.miniButton}
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
            </li>
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  className={styles.projectBox}
                  to={`/project/${project.id}`}
                  onClick={() => {
                    setCurrentProjectId(project.id);
                    setProjectMode(project.id, project.mode);
                  }}
                >
                  <Tooltip text={project.title}>
                    <div className={styles.title}>{project.title}</div>
                  </Tooltip>
                  <span className={styles.modeFont}>
                    ({modeLabel(project.mode)})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Home;
