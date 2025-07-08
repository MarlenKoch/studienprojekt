import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Project } from "../../types/Project";
import { useProjectTimer } from "../../context/ProjectTimerContext";
import { toast } from "react-toastify";
import { InfoPopUp } from "../InfoPopUp/InfoPopUp";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectMode, setNewProjectMode] = useState<number>(0); // Initiale Mode-Auswahl
  const [showInfoPopUp, setShowInfoPopUp] = useState(false); // Popup-Status
  const [addMode, setAddMode] = useState(false);


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
      toast.warn("Please enter all required fields.");
      return;
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
  };

  return (
    <div>
      {showInfoPopUp && <InfoPopUp onClose={() => setShowInfoPopUp(false)} />}
      <div className={styles.scrollableContainer}>
        <ul className={styles.projectGrid}>
          <li>
            {!addMode ? (
              <button className={styles.projectBox} onClick={() => setAddMode(true)}>
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
                  <option value={0}>Mode 0</option>
                  <option value={1}>Mode 1</option>
                  <option value={2}>Mode 2</option>
                </select>
                <div className={styles.buttonRow}>
                  <button onClick={handleAddProject} className={styles.miniButton}>Erstellen</button>
                  <button onClick={() => setAddMode(false)} className={styles.miniButton}>X</button>
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
                {project.title}
                <span style={{ fontSize: "80%", marginTop: "8px" }}>(Mode: {project.mode})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Home;
