import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import ProjectView from "./components/ProjectView";
import { ProjectTimerProvider } from "./context/ProjectTimerContext";

const App: React.FC = () => {
  return (
    <ProjectTimerProvider>
      <Router>
        <div style={{ padding: "20px" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1>Schreibassistent</h1>
          </Link>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectView />} />{" "}
            {/* Adjust path */}
          </Routes>
        </div>
      </Router>
    </ProjectTimerProvider>
  );
};

export default App;
