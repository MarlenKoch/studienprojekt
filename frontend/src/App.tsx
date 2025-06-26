import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import ProjectView from "./components/ProjectView";
import { StudentContext } from "./context/StudentContext";
import { ProjectTimerProvider } from "./context/ProjectTimerContext";

const App: React.FC = () => {
  const [isStudent, setIsStudent] = useState(false);
  const studentBool = isStudent ? true : false;

  return (
    <StudentContext value={studentBool}>
      <ProjectTimerProvider>
        <label>
          <input
            type="checkbox"
            checked={isStudent}
            onChange={(e) => {
              setIsStudent(e.target.checked);
            }}
          />
          Schülermodus
        </label>
        <hr />
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
    </StudentContext>
  );
};

export default App;
