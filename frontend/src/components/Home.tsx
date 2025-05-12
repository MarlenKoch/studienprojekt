import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Project } from "../types/Project";

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectMode, setNewProjectMode] = useState<number>(0); // Initiale Mode-Auswahl

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

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    if (newProjectTitle.trim() === "") {
      alert("Please enter all required fields.");
      return;
    }

    try {
      const newProject = {
        title: newProjectTitle,
        mode: newProjectMode, // Mode wird jetzt übergeben
      };

      const response = await axios.post<Project>(
        "http://localhost:8000/projects",
        newProject,
        { headers: { "Content-Type": "application/json" } }
      );
      setProjects([...projects, response.data]);
      setNewProjectTitle("");
      setNewProjectMode(0); // Zurücksetzen des Mode-Auswahl-Dropdowns
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div>
      <h2>Home Component</h2>
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
            <Link to={`/project/${project.id}`}>
              {project.title} (Mode: {project.mode})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
