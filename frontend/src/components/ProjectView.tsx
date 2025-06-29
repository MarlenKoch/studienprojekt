import axios from "axios";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { Project } from "../types/Project";
import { Paragraph } from "../types/Paragraph";
import ChatComponent from "./ChatComponent";
import { useProjectTimer } from "../context/ProjectTimerContext";

// 1. Toastify import
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [newParagraphContent, setNewParagraphContent] = useState("");
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(
    null
  );
  const [aiModelList, setaiModelList] = useState<string[]>([]);
  //const [promptsJson, setPromptsJson] = useState<string>("");
  const [isCreatingPromptJson, setIsCreatingPromptJson] =
    useState<boolean>(false);

  // Timer Popup
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [isChangingMode, setIsChangingMode] = useState<boolean>(false);
  const { timeLeft, startTimer, stopTimer, setOnTimeout, setProjectMode } =
    useProjectTimer();

  // Fetches project and paragraph data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get<Project>(
          `http://localhost:8000/projects/${id}`
        );
        setProject(response.data);
        setProjectMode(response.data.id, response.data.mode);
        if (response.data.mode === 2) {
          if (response.data.starttime && response.data.duration) {
            startTimer(
              response.data.starttime +
                response.data.duration -
                Math.floor(Date.now() / 1000)
            );
          } else {
            setShowTimerPopup(true); // Show timer popup
          }
        }
      } catch (error) {
        // 2. Use toast for error
        toast.error("Error fetching project");
        console.error("Error fetching project:", error);
      }
    };

    const fetchParagraphs = async () => {
      try {
        const response = await axios.get<Paragraph[]>(
          `http://localhost:8000/projects/${id}/paragraphs`
        );
        setParagraphs(response.data);
      } catch (error) {
        toast.error("Error fetching paragraphs");
        console.error("Error fetching paragraphs:", error);
      }
    };

    fetchProject();
    fetchParagraphs();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [id]);

  // Timer starten, wenn Popup bestätigt wird
  const handleStartTimerFromPopUp = () => {
    const totalSeconds =
      Number(timerHours) * 3600 +
      Number(timerMinutes) * 60 +
      Number(timerSeconds);
    console.log(project?.id);
    axios.put(`http://localhost:8000/projects/${project?.id}`, {
      starttime: Math.floor(Date.now() / 1000),
      duration: totalSeconds,
    });
    startTimer(totalSeconds);
    setShowTimerPopup(false);
    toast.success("Timer started!");
  };

  // Sets a callback for when the timer runs out.
  useEffect(() => {
    setOnTimeout(() => {
      toast.info("Timer finished!");
      setIsChangingMode(true);
    });
  }, [setOnTimeout]);

  // Handles changing project mode when triggered by timer or blur.
  useEffect(() => {
    if (isChangingMode === true) {
      if (project?.mode === 2) updateProjectMode(3);
      setIsChangingMode(false);
    }
  }, [isChangingMode]);

  // Fetches prompts and generates PDF when requested.
  useEffect(() => {
    const getPromptsGeneratePDF = async () => {
      if (project?.id !== undefined) {
        try {
          const response = await axios.get<string>(
            `http://localhost:8000/promptverzeichnis/`,
            { params: { projectId: project.id } }
          );
          //setPromptsJson(response.data);

          generatePDF(
            JSON.stringify(response.data),
            `promptverzeichnis_${project?.title}`
          );
          toast.success("PDF generated and downloaded!");
        } catch (error) {
          toast.error("Error fetching chats for PDF");
          console.error("Error fetching chats:", error);
        }
      } else {
        if (isCreatingPromptJson === true) {
          toast.error("Project ID is undefined");
        }
      }
    };
    setIsCreatingPromptJson(false);
    getPromptsGeneratePDF();
  }, [isCreatingPromptJson]);

  // Fetches the available AI model names
  useEffect(() => {
    const fetchOllamaModelNames = async () => {
      try {
        const response = await fetch("http://localhost:8000/aimodels");

        if (!response.ok) {
          throw new Error(`Error fetching model names: ${response.statusText}`);
        }

        const data = await response.json();
        const modelNames = data.models.map((model: { name: string }) => {
          return model.name.endsWith(":latest")
            ? model.name.substring(0, model.name.length - ":latest".length)
            : model.name;
        });
        setaiModelList(modelNames);
      } catch (error) {
        toast.error("Failed to fetch model names");
        console.error("Failed to fetch model names:", error);
      }
    };
    fetchOllamaModelNames();
  }, [activeParagraphId]);

  // Handles adding a new paragraph
  const handleAddParagraph = async () => {
    if (newParagraphContent.trim() === "") {
      toast.warn("Please enter the paragraph content.");
      return;
    }

    if (!id) {
      toast.error("Project ID is undefined.");
      return;
    }

    try {
      const newParagraph = {
        projectId: parseInt(id, 10),
        content: newParagraphContent,
      };

      const response = await axios.post<Paragraph>(
        "http://localhost:8000/paragraphs",
        newParagraph,
        { headers: { "Content-Type": "application/json" } }
      );

      setParagraphs([...paragraphs, response.data]);
      setNewParagraphContent("");
      toast.success("Paragraph added!");
    } catch (error) {
      toast.error("Error creating paragraph.");
      console.error("Error creating paragraph:", error);
    }
  };

  // Sets active paragraph
  const handleParagraphClick = (paragraphId: number) => {
    setActiveParagraphId(paragraphId);
  };

  // Updates content locally
  const handleParagraphChange = (paragraphId: number, newContent: string) => {
    setParagraphs(
      paragraphs.map((paragraph) =>
        paragraph.id === paragraphId
          ? { ...paragraph, content: newContent }
          : paragraph
      )
    );
  };

  // Save paragraph
  const handleSaveParagraph = async (paragraphId: number) => {
    const paragraph = paragraphs.find((p) => p.id === paragraphId);
    if (!paragraph) return;

    try {
      await axios.put(`http://localhost:8000/paragraphs/${paragraphId}`, {
        content: paragraph.content,
      });
      toast.success("Paragraph saved!");
    } catch (error) {
      toast.error("Error saving paragraph.");
      console.error("Error saving paragraph:", error);
    }
  };

  // PDF Generator
  function generatePDF(jsonString: string, fileName: string) {
    const doc = new jsPDF();

    const json = JSON.parse(jsonString);
    const formattedJson = JSON.stringify(json, null, 2);

    const lines = doc.splitTextToSize(formattedJson, 180);

    doc.text(lines, 10, 5);
    doc.save(`${fileName}.pdf`);
  }

  // Window focus/blur
  const handleFocus = () => {
    // You may use toast if you want to inform user on focus gain/loss.
    // toast.info("Das Fenster hat den Fokus erhalten.");
  };

  const handleBlur = async () => {
    stopTimer();
    setIsChangingMode(true);
    // toast.info("Das Fenster hat den Fokus verloren. Timer stopped, mode changed.");
  };

  // Update mode
  const updateProjectMode = async (newMode: number) => {
    if (!project) {
      toast.warn("No project loaded.");
      return;
    }
    try {
      // await axios.put(`http://localhost:8000/projects/${project.id}`, {
      //   mode: newMode,
      // });
      setProject({ ...project, mode: newMode });
      setProjectMode(project.id, 3);
      toast.success(`Project mode set to ${newMode}.`);
    } catch (error) {
      toast.error("Error updating project mode.");
      console.error("Error updating project mode:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-center" autoClose={2400} />
      <h3>
        Remaining Time:{" "}
        {timeLeft !== null ? `${timeLeft} seconds` : "Not Applicable"}
      </h3>
      <h2>
        Project View for Project ID: {id}, {project?.id}
      </h2>
      {project ? (
        <div>
          <h3>{project.title}</h3>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <h3>Paragraphs</h3>
      <ul>
        {paragraphs.map((paragraph) => (
          <li key={paragraph.id}>
            <textarea
              value={paragraph.content}
              onChange={(e) =>
                project?.mode !== 3
                  ? handleParagraphChange(paragraph.id, e.target.value)
                  : undefined
              }
              placeholder="Edit paragraph content"
              style={{
                width: "100%",
                height: "auto",
                minHeight: "60px",
                overflow: "hidden",
                resize: "none",
              }}
              onClick={() => handleParagraphClick(paragraph.id)}
              readOnly={project?.mode === 3}
            />
            <button
              onClick={(e) => {
                e.stopPropagation(); // So button doesn't trigger parent click
                navigator.clipboard.writeText(paragraph.content || "");
              }}
            >
              📋
            </button>
            {project?.mode !== 3 && (
              <button onClick={() => handleSaveParagraph(paragraph.id)}>
                Save
              </button>
            )}
          </li>
        ))}
      </ul>
      {(project?.mode === 0 || project?.mode === 1 || project?.mode === 2) && (
        <div>
          <h3>Add New Paragraph</h3>
          <input
            type="text"
            value={newParagraphContent}
            onChange={(e) => setNewParagraphContent(e.target.value)}
            placeholder="Enter paragraph content"
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleAddParagraph}>Add Paragraph</button>
        </div>
      )}
      {activeParagraphId !== null && (
        <ChatComponent
          paragraphId={activeParagraphId}
          aiModelList={aiModelList}
          // mode={project?.mode}
        />
      )}
      <button onClick={() => setIsCreatingPromptJson(true)}>
        Generate PDF
      </button>
      <div>
        {project?.mode === 1 || project?.mode === 2 ? (
          <p>Im Schülermodus</p>
        ) : (
          <p>Du bist kein Schüler</p>
        )}
      </div>
      {/* TIMER POPUP für Modus 2 */}
      {showTimerPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <h3>Timer einstellen</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="number"
                min={0}
                max={23}
                value={timerHours}
                onChange={(e) => setTimerHours(Number(e.target.value))}
                style={{ width: 50 }}
              />{" "}
              Stunden
              <input
                type="number"
                min={0}
                max={59}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                style={{ width: 50 }}
              />{" "}
              Minuten
              <input
                type="number"
                min={0}
                max={59}
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                style={{ width: 50 }}
              />{" "}
              Sekunden
            </div>
            <button onClick={handleStartTimerFromPopUp}>Starten</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
