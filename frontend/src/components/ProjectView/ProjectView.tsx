import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Project } from "../../types/Project";
import { Paragraph } from "../../types/Paragraph";
import ChatComponent from "../Chat/ChatComponent";
import { useProjectTimer } from "../../context/ProjectTimerContext";
import "jspdf-autotable";
import jsPDF from "jspdf";
//import primereact from "primereact";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generatePDF } from "../GeneratePDF/GeneratePDF";

import { useNavigate } from "react-router-dom";
import { Splitter, SplitterPanel } from "primereact/splitter";
import TextareaAutosize from "react-textarea-autosize";
import Tooltip from "../Tooltip/Tooltip";

import styles from "./ProjectView.module.css";

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  // const [newParagraphContent, setNewParagraphContent] = useState("");
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(
    null
  );
  const [aiModelList, setaiModelList] = useState<string[]>([]);
  //const [promptsJson, setPromptsJson] = useState<string>("");
  const [isCreatingPromptJson, setIsCreatingPromptJson] =
    useState<boolean>(false);
  const navigate = useNavigate();
  // Timer Popup
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState<string>("");
  const [isChangingMode, setIsChangingMode] = useState<boolean>(false);
  const {
    timeLeft,
    startTimer,
    stopTimer,
    setOnTimeout,
    setProjectMode,
    currentMode,
  } = useProjectTimer();

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

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [id]);

  // Timer starten, wenn Popup bestätigt wird
  const handleStartTimerFromPopUp = () => {
    const totalSeconds =
      Number(timerHours) * 3600 +
      Number(timerMinutes) * 60 +
      Number(timerSeconds);
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
      if (project?.mode === 2) {
        updateProjectMode(3);
        setIsCreatingPromptJson(true);
        handleGeneratePDF();
      }
      setIsChangingMode(false);
    }
  }, [isChangingMode]);

  // Fetches prompts and generates PDF when requested.
  useEffect(() => {
    if (!isCreatingPromptJson) return;
    const getPromptsGeneratePDF = async () => {
      if (project?.id !== undefined) {
        try {
          const response = await axios.get<string>(
            `http://localhost:8000/promptverzeichnis/`,
            { params: { projectId: project.id } }
          );
          generatePDF(
            JSON.stringify(response.data),
            `Promptverzeichnis ${project?.title ?? "Projekt"}`,
            "/logo-test.png"
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
        const response = await fetch("http://localhost:8000/aiModels");

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

  useEffect(() => {
    if (project?.title) {
      setEditableTitle(project.title);
    }
  }, [project?.title]);

  // Handles adding a new paragraph
  const handleAddParagraph = async () => {
    // if (newParagraphContent.trim() === "") {
    //   toast.warn("Please enter the paragraph content.");
    //   return;
    // }

    if (!id) {
      toast.error("Project ID is undefined.");
      return;
    }

    try {
      const newParagraph = {
        projectId: parseInt(id, 10),
        content: "",
      };

      const response = await axios.post<Paragraph>(
        "http://localhost:8000/paragraphs",
        newParagraph,
        { headers: { "Content-Type": "application/json" } }
      );

      setParagraphs([...paragraphs, response.data]);
      // setNewParagraphContent("");
      toast.success("Paragraph added!");
    } catch (error) {
      toast.error("Error creating paragraph.");
      console.error("Error creating paragraph:", error);
    }
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

  const handleDeleteParagraph = async (paragraphId: number) => {
    try {
      if (currentMode == 2 || currentMode == 1) {
        await axios.delete(`http://localhost:8000/paragraphs/${paragraphId}`);
      } else if (currentMode == 0) {
        await axios.delete(
          `http://localhost:8000/paragraphs/with_answers/${paragraphId}`
        );
      }
      // 4. Aus localem State entfernen
      setParagraphs(paragraphs.filter((p) => p.id !== paragraphId));
      if (activeParagraphId === paragraphId) setActiveParagraphId(null);

      toast.success(
        "Paragraph (inkl. aller Chats und Answers) wurde gelöscht!"
      );
    } catch (error) {
      toast.error("Fehler beim Löschen eines Paragraphen, Chat oder Answers.");
      console.error(error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) {
      toast.error("Kein Projekt geladen.");
      return;
    }

    if (
      !window.confirm(
        "Möchtest du das Projekt und alle Paragraphen wirklich löschen?"
      )
    )
      return;

    try {
      // 2. Projekt löschen
      await axios.delete(`http://localhost:8000/projects/${project.id}`);

      toast.success("Projekt und alle Paragraphen gelöscht!");
      navigate("/"); // Zur Startseite oder zur Projektliste, je nach Routing
    } catch (error) {
      toast.error("Fehler beim Löschen des Projekts oder Paragraphen.");
      console.error("Error deleting project or paragraphs:", error);
    }
  };

  const handleBlur = async () => {
    stopTimer();
    setIsChangingMode(true);
  };

  // Update mode
  const updateProjectMode = async (newMode: number) => {
    if (!project) {
      toast.warn("No project loaded.");
      return;
    }
    try {
      setProject({ ...project, mode: newMode });
      setProjectMode(project.id, 3);
      toast.success(`Project mode set to ${newMode}.`);
    } catch (error) {
      toast.error("Error updating project mode.");
      console.error("Error updating project mode:", error);
    }
  };

  const handleGeneratePDF = () => {
    if (!project) {
      toast.error("Kein Projekt geladen");
      return;
    }
    if (!paragraphs.length) {
      toast.error("Keine Paragraphen im Projekt");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Titel
    let y = 20;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(project.title || "Projekt", 20, y);

    // Abstand unter Titel
    y += 16;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    paragraphs.forEach((para) => {
      const lines: string[] = doc.splitTextToSize(para.content, 170);
      lines.forEach((line: string) => {
        doc.text(line, 20, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      y += 3; // Wenig Abstand zum nächsten Paragraphen
    });

    doc.save(
      `${
        project.title ? project.title.replace(/[^a-z0-9]/gi, "_") : "Projekt"
      }.pdf`
    );
    toast.success("PDF wurde erstellt!");
  };

  function formatTimeLeft(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h ? `${h}h` : null, m ? `${m}m` : null, `${s}s`]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className={styles.wrapper}>
      {timeLeft !== null && (
        <div className={styles.tag}>
          Verbleibende Zeit: <strong>{formatTimeLeft(timeLeft)}</strong>
        </div>
      )}

      {/* Top-Bar: Titel + Edit/Delete */}
      <div className={styles.topBar}>
        {isEditingTitle ? (
          <>
            <input
              className={styles.input}
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              style={{ fontSize: "1.5rem" }}
            />
            <Tooltip text="Speichern">
              <button
                className={styles.actionBtn}
                onClick={async () => {
                  if (!project) return;
                  try {
                    await axios.put(
                      `http://localhost:8000/projects/${project.id}`,
                      { title: editableTitle }
                    );
                    setProject({ ...project, title: editableTitle });
                    setIsEditingTitle(false);
                    toast.success("Title updated!");
                  } catch (err) {
                    toast.error("Error updating title");
                    console.error("Error updating title:", err);
                  }
                }}
              >
                Save
              </button>
            </Tooltip>
            <Tooltip text="Abbrechen">
              <button
                className={[styles.actionBtn, styles.danger].join(" ")}
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditableTitle(project?.title ?? "");
                }}
              >
                Cancel
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flex: 1,
                textAlign: "left",
              }}
            >
              <div>
                <span className={styles.topBarTitle}>{project?.title}</span>
                {(project?.mode === 1 || project?.mode === 2) && (
                  <span className={styles.tag}>Im Schülermodus</span>
                )}
              </div>
            </div>
            <Tooltip text="Bearbeiten">
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setIsEditingTitle(true);
                  setEditableTitle(project?.title ?? "");
                }}
              >
                Edit
              </button>
            </Tooltip>
          </>
        )}
        <div>
          <Tooltip text="Prompt PDF erstellen">
            <button
              className={styles.actionBtn}
              onClick={() => setIsCreatingPromptJson(true)}
            >
              Generate Prompt PDF
            </button>
          </Tooltip>
          <Tooltip text="Text PDF erstellen">
            <button className={styles.actionBtn} onClick={handleGeneratePDF}>
              Generate Text PDF
            </button>
          </Tooltip>
          <Tooltip text="Projekt löschen">
            <button
              className={[styles.actionBtn, styles.danger].join(" ")}
              onClick={handleDeleteProject}
            >
              Delete Project
            </button>
          </Tooltip>

          {project?.mode === 2 && (
            <Tooltip text="Abgeben">
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setIsChangingMode(true);
                  stopTimer();
                }}
              >
                abgeben
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <Splitter
        key={activeParagraphId ? "open-1" : "closed-1"}
        className={styles.splitter}
        gutterSize={activeParagraphId ? 5 : 0}
        style={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          width: "100%",
          minWidth: "min-content",
        }}
      >
        <SplitterPanel
          size={activeParagraphId ? 50 : 100000}
          minSize={10}
          style={{
            height: "100%",
            flex: activeParagraphId ? 1 : 2,
            minHeight: 0,
            display: "flex",
          }}
        >
          <div
            className={styles.sectionCard}
            style={{
              flex: 1,
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "row",
              position: "relative",
              paddingRight: activeParagraphId ? "0px" : "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <ul className={styles.paragraphList}>
                {paragraphs.map((paragraph) => (
                  <li key={paragraph.id}>
                    <div className={styles.paragraphRow}>
                      <TextareaAutosize
                        className={styles.textarea}
                        value={paragraph.content}
                        onChange={(e) =>
                          project?.mode !== 3
                            ? handleParagraphChange(
                                paragraph.id,
                                e.target.value
                              )
                            : undefined
                        }
                        placeholder="Edit paragraph content"
                        onClick={() => {
                          if (activeParagraphId)
                            setActiveParagraphId(paragraph.id);
                        }}
                        readOnly={project?.mode === 3}
                        minRows={8}
                      />
                      <div className={styles.paragraphActions}>
                        <Tooltip text="KI Chat">
                          <button
                            className={styles.iconBtn}
                            onClick={() => setActiveParagraphId(paragraph.id)}
                            title="AI Chat"
                          >
                            🚀
                          </button>
                        </Tooltip>
                        <Tooltip text="Kopieren">
                          <button
                            className={styles.iconBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                paragraph.content || ""
                              );
                            }}
                            title="Copy"
                          >
                            📋
                          </button>
                        </Tooltip>
                        {project?.mode !== 3 && (
                          <>
                            <Tooltip text="Absatz speichern">
                              <button
                                className={styles.iconBtn}
                                onClick={() =>
                                  handleSaveParagraph(paragraph.id)
                                }
                              >
                                📂
                              </button>
                            </Tooltip>
                            <Tooltip text="Absatz löschen">
                              <button
                                className={[styles.iconBtn, styles.danger].join(
                                  " "
                                )}
                                onClick={() =>
                                  handleDeleteParagraph(paragraph.id)
                                }
                              >
                                🗑
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {(project?.mode === 0 ||
                project?.mode === 1 ||
                project?.mode === 2) && (
                <div>
                  <Tooltip text="Absatz hinzufügen">
                    <button
                      className={styles.actionBtn}
                      onClick={handleAddParagraph}
                    >
                      Paragraph hinzufügen
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
            {activeParagraphId && (
              <Tooltip text="Chats schließen">
                <button
                  style={{
                    margin: 0,
                    padding: 0,
                    background: "none",
                  }}
                  onClick={() => setActiveParagraphId(null)}
                >
                  {"◀"}
                </button>
              </Tooltip>
            )}
          </div>
        </SplitterPanel>
        <SplitterPanel
          size={activeParagraphId ? 50 : 0}
          style={{
            height: "100%",
            flex: activeParagraphId ? 1 : 0,
            minHeight: 0,
            display: "flex",
          }}
        >
          {activeParagraphId !== null && (
            <ChatComponent
              paragraphId={activeParagraphId}
              aiModelList={aiModelList}
              projectId={project?.id}
            />
          )}
        </SplitterPanel>
      </Splitter>

      {/* TIMER POPUP */}
      {showTimerPopup && (
        <div className={styles.timerPopBg}>
          <div className={styles.timerPopContent}>
            <h3>Timer einstellen</h3>
            <div className={styles.timerInputs}>
              <input
                className={styles.timerInput}
                type="number"
                min={0}
                max={23}
                value={timerHours}
                onChange={(e) => setTimerHours(Number(e.target.value))}
              />{" "}
              Stunden
              <input
                className={styles.timerInput}
                type="number"
                min={0}
                max={59}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
              />{" "}
              Minuten
              <input
                className={styles.timerInput}
                type="number"
                min={0}
                max={59}
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
              />{" "}
              Sekunden
            </div>
            <Tooltip text="Timer starten">
              <button
                className={styles.actionBtn}
                onClick={handleStartTimerFromPopUp}
              >
                Starten
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
