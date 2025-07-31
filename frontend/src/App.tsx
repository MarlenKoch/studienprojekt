import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import ProjectView from "./components/ProjectView/ProjectView";
import { ProjectTimerProvider } from "./context/ProjectTimerContext";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Impressum from "./components/FooterPages/Impressum";
import UeberUns from "./components/FooterPages/UeberUns";
import Models from "./components/Models/Models";
import { ToastContainer } from "react-toastify";

const App: React.FC = () => {
  return (
    <ProjectTimerProvider>
      <Router>
        <div>
          <Header />
          <main style={{ flex: 1 }}>
            <ToastContainer position="top-center" autoClose={2400} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project/:id" element={<ProjectView />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/ueberUns" element={<UeberUns />} />
              <Route path="/KIModelle" element={<Models />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ProjectTimerProvider>
  );
};

export default App;
