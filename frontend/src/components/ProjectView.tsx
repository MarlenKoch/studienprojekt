import axios from "axios";
import React, { useEffect, useState, useContext, useRef } from "react";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { Project } from "../types/Project";
import { Paragraph } from "../types/Paragraph";
import ChatComponent from "./ChatComponent";
import { StudentContext } from "../context/StudentContext";

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [newParagraphContent, setNewParagraphContent] = useState("");
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(
    null
  );
  const [aiModelList, setaiModelList] = useState<string[]>([]);
  const [promptsJson, setPromptsJson] = useState<string>("");
  const [isCreatingPromptJson, setIsCreatingPromptJson] =
    useState<boolean>(false);

  const isStudent = useContext(StudentContext);
  const timerDuration = 20; // Set to required duration
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Store remaining time for timer
  const timerIntervalRef = useRef<number | null>(null);
  const [isChangingMode, setIsChangingMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log("id ist: ", id);
        const response = await axios.get<Project>(
          `http://localhost:8000/projects/${id}`
        );
        console.log(response.data);
        setProject(response.data);
        if (response.data.mode === 2) {
          //updateProjectMode(3);
          setIsChangingMode(true);
        } else if (response.data.mode === 3) {
          //updateProjectMode(4);
          setIsChangingMode(true);
        }
        // setProject({
        //   id: 0,
        //   title: "fluub",
        //   mode: 0,
        // });

        // Start timer if project mode is 2
        // if (response.data.mode === 2) {
        //   console.log("start timer with: ", project, project?.title);
        //   startTimer(timerDuration);
        // }
      } catch (error) {
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
        console.error("Error fetching paragraphs:", error);
      }
    };

    fetchProject();
    fetchParagraphs();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [id]); // Re-run when project `id` changes, handles switching projects

  useEffect(() => {
    console.log("ues effect: ", project);
    console.log("ftüü: ", project);
    if (project?.mode === 2 && timeLeft === null) {
      console.log("start timer with: ", project, project?.title);
      //updateProjectMode(3);
      setIsChangingMode(true);
      startTimer(timerDuration);
    } else if (project?.mode === 3) {
      stopTimer();
      //updateProjectMode(4);
      setIsChangingMode(true);
    }
  }, [project?.id]);

  useEffect(() => {
    console.log("ues effect: ", project);
    if (project?.mode === 2) updateProjectMode(3);
    else if (project?.mode === 3) updateProjectMode(4);
    setIsChangingMode(false);
  }, [isChangingMode]);

  // useEffect(() => {
  //   if (project?.mode === 2 && timeLeft === null) {
  //     startTimer(timerDuration);
  //   }
  // }, [project?.mode]);

  useEffect(() => {
    const getPromptsGeneratePDF = async () => {
      if (project?.id !== undefined) {
        try {
          const response = await axios.get<string>(
            `http://localhost:8000/promptverzeichnis/`,
            { params: { project_id: project.id } }
          );
          setPromptsJson(response.data);
          console.log(promptsJson);

          generatePDF(
            JSON.stringify(response.data),
            `promptverzeichnis_${project?.title}`
          );
        } catch (error) {
          console.error("Error fetching chats:", error);
        }
      } else {
        if (isCreatingPromptJson === true) {
          throw new Error("Project ID is undefined");
        }
      }
    };
    setIsCreatingPromptJson(false);
    getPromptsGeneratePDF();
  }, [isCreatingPromptJson]);

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
        console.error("Failed to fetch model names:", error);
      }
    };
    fetchOllamaModelNames();
  }, [activeParagraphId]);

  const handleAddParagraph = async () => {
    if (newParagraphContent.trim() === "") {
      alert("Please enter the paragraph content.");
      return;
    }

    if (!id) {
      console.error("Project ID is undefined.");
      return;
    }

    try {
      const newParagraph = {
        project_id: parseInt(id, 10),
        content_json: newParagraphContent,
      };

      const response = await axios.post<Paragraph>(
        "http://localhost:8000/paragraphs",
        newParagraph,
        { headers: { "Content-Type": "application/json" } }
      );

      setParagraphs([...paragraphs, response.data]);
      setNewParagraphContent("");
    } catch (error) {
      console.error("Error creating paragraph:", error);
    }
  };

  const handleParagraphClick = (paragraphId: number) => {
    setActiveParagraphId(paragraphId);
  };

  const handleParagraphChange = (paragraphId: number, newContent: string) => {
    setParagraphs(
      paragraphs.map((paragraph) =>
        paragraph.id === paragraphId
          ? { ...paragraph, content_json: newContent }
          : paragraph
      )
    );
  };

  const handleSaveParagraph = async (paragraphId: number) => {
    const paragraph = paragraphs.find((p) => p.id === paragraphId);
    if (!paragraph) return;

    try {
      await axios.put(`http://localhost:8000/paragraphs/${paragraphId}`, {
        content_json: paragraph.content_json,
      });
      alert("Paragraph saved successfully!");
    } catch (error) {
      console.error("Error saving paragraph:", error);
    }
  };

  function generatePDF(jsonString: string, fileName: string) {
    const doc = new jsPDF();

    const json = JSON.parse(jsonString);
    const formattedJson = JSON.stringify(json, null, 2);

    const lines = doc.splitTextToSize(formattedJson, 180);

    doc.text(lines, 10, 5);
    doc.save(`${fileName}.pdf`);
  }

  const handleFocus = () => {
    console.log("Das Fenster hat den Fokus erhalten.");
  };

  const handleBlur = async () => {
    console.log("Das Fenster hat den Fokus verloren.");
    stopTimer(); // Stop the timer
    setIsChangingMode(true);
    // if (project?.mode === 3) {
    //   setIsChangingMode(true);
    //   console.log("plumps");
    // }
    console.log("modus:  ", project?.mode);
    console.log(project);
  };

  const updateProjectMode = async (newMode: number) => {
    console.log("function called: ", project, project?.title);
    if (!project) {
      console.log("no project");
      return;
    }
    try {
      await axios.put(`http://localhost:8000/projects/${project.id}`, {
        mode: newMode,
      });
      setProject({ ...project, mode: newMode });
      console.log(`Projektmodus wurde auf ${newMode} gesetzt.`);
    } catch (error) {
      console.error("Error updating project mode:", error);
    }
  };

  const startTimer = (duration: number) => {
    const endTime = Date.now() + duration * 1000;

    if (!timerIntervalRef.current) {
      timerIntervalRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const newTimeLeft = Math.max(
          Math.round((endTime - currentTime) / 1000),
          0
        );

        setTimeLeft(newTimeLeft);

        if (newTimeLeft <= 0 && timerIntervalRef.current) {
          stopTimer();
          console.log("ende");
          console.log("vor dem updaten: ", project, project?.title);
          setIsChangingMode(true);
          console.log("So jetze aberr");
        }
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null; // Reset interval reference
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>
        Remaining Time:{" "}
        {timeLeft !== null ? `${timeLeft} seconds` : "Not Applicable"}
      </h3>{" "}
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
              value={paragraph.content_json}
              onChange={(e) =>
                handleParagraphChange(paragraph.id, e.target.value)
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
            />
            <button onClick={() => handleSaveParagraph(paragraph.id)}>
              Save
            </button>
          </li>
        ))}
      </ul>
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
      {activeParagraphId !== null && (
        <ChatComponent
          paragraphId={activeParagraphId}
          aiModelList={aiModelList}
        />
      )}
      <button onClick={() => setIsCreatingPromptJson(true)}>
        Generate PDF
      </button>
      <div>
        {isStudent ? <p>Im Schülermodus</p> : <p>Du bist kein Schüler</p>}
      </div>
    </div>
  );
};

export default ProjectView;
