import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Project } from '../types/Project'


const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");

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
        sources_json: "{}", // Default empty JSON
      };

      const response = await axios.post<Project>(
        "http://localhost:8000/projects",
        newProject,
        { headers: { "Content-Type": "application/json" } }
      );
      setProjects([...projects, response.data]);
      setNewProjectTitle("");
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
      <button onClick={handleAddProject}>Add Project</button>
      <h3>Existing Projects:</h3>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={`/project/${project.id}`}>
              {project.title} - {project.sources_json}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
