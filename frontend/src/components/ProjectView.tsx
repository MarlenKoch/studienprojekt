import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { Project } from "../types/Project";
import { Paragraph } from "../types/Paragraph";
import ChatComponent from "./ChatComponent";
import { StudentContext } from "../context/StudentContext";
import { Splitter, SplitterPanel } from "primereact/splitter";
// import { Card } from "primereact/card";
import { Button } from "primereact/button";

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [newParagraphContent, setNewParagraphContent] = useState("");
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(
    null
  );
  const [aiModelList, setaiModelList] = useState<string[]>([]);
  const [promptsJson, setPrompsJson] = useState<string>("");
  const [isCreatingPromptJson, setIsCreatingPromptJson] =
    useState<boolean>(false);

  const isStudent = useContext(StudentContext);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get<Project>(
          `http://localhost:8000/projects/${id}`
        );
        setProject(response.data);
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
  }, [id]);

  useEffect(() => {
    const getPromptsGeneratePDF = async () => {
      if (project?.id !== undefined) {
        try {
          const response = await axios.get<string>(
            `http://localhost:8000/promptverzeichnis/`,
            { params: { project_id: project.id } }
          );
          setPrompsJson(response.data);
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

  return (
    <div>
      <h5>Project View for Project ID: {id}</h5>
      {project ? <h3>{project.title}</h3> : <p>Loading...</p>}

      <Splitter style={{ height: "500px" }}>
        {/* Scrollable Panel for Paragraphs */}
        <SplitterPanel
          size={30}
          style={{ overflow: "auto" }}
          className="flex align-items-center justify-content-center"
        >
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
                <Button
                  label="Save"
                  onClick={() => handleSaveParagraph(paragraph.id)}
                />
              </li>
            ))}
          </ul>
          <div>
            <input
              type="text"
              value={newParagraphContent}
              onChange={(e) => setNewParagraphContent(e.target.value)}
              placeholder="Enter paragraph content"
              style={{ marginRight: "10px" }}
            />
            <Button label="Add Paragraph" onClick={handleAddParagraph} />
          </div>
        </SplitterPanel>

        {/* Scrollable Panel for Saved Chats */}
        <SplitterPanel size={30} style={{ overflow: "auto" }}>
          <p>List of saved chats will appear here.</p>
        </SplitterPanel>

        {/* Scrollable Panel for Current Chat */}
        <SplitterPanel size={40} style={{ overflow: "auto" }}>
          {activeParagraphId !== null && (
            <ChatComponent
              paragraphId={activeParagraphId}
              aiModelList={aiModelList}
            />
          )}
        </SplitterPanel>
      </Splitter>

      <Button
        label="Generate PDF"
        onClick={() => setIsCreatingPromptJson(true)}
      />
      <div>
        {isStudent ? <p>Im Schülermodus</p> : <p>Du bist kein Schüler</p>}
      </div>
    </div>
  );
};

export default ProjectView;
