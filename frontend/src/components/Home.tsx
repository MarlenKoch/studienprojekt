import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Project } from "../types/Project";
import { useProjectTimer } from "../context/ProjectTimerContext";
import { toast } from "react-toastify";

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectMode, setNewProjectMode] = useState<number>(0); // Initiale Mode-Auswahl
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
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div>
      <h2>Home Component</h2>
      <img src="/logo-test.svg" width={60} height={60} alt="KI-Logo" />
      <h3>
        aktuelle projekt ist {currentProjectId}, mode: {currentMode}
      </h3>
      <input
        type="text"
        value={newProjectTitle}
        onChange={(e) => setNewProjectTitle(e.target.value)}
        placeholder="Enter new project title"
        style={{ marginRight: "10px" }}
      />
      <select
        value={newProjectMode}
        onChange={(e) => setNewProjectMode(Number(e.target.value))}
        style={{ marginRight: "10px" }}
      >
        <option value={0}>Mode 0</option>
        <option value={1}>Mode 1</option>
        <option value={2}>Mode 2</option>
      </select>
      <button onClick={handleAddProject}>Add Project</button>
      <h3>Existing Projects:</h3>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              to={`/project/${project.id}`}
              onClick={() => {
                setCurrentProjectId(project.id);
                setProjectMode(project.id, project.mode);
              }}
            >
              {project.title} (Mode: {project.mode})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
