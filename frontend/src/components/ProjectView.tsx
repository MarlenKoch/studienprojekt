import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface Project {
  id: number;
  title: string;
  sources_json: string;
}

interface Paragraph {
  id: number;
  project_id: number;
  content_json: string;
}

interface Chat {
  id: number;
  title: string;
  aiModel: string;
  content_json: string;
  paragraph_id: number;
}

interface ContextInputs {
  paragraph_content: string;
  writing_style: string;
  task: string;
  user_context: string;
}

interface ChatRequest {
  user_prompt: string;
  ai_model: string;
  context_inputs: ContextInputs;
}

interface ChatResponse {
  response: string;
}

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [newParagraphContent, setNewParagraphContent] = useState("");
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(
    null
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [systemInfo, setSystemInfo] = useState("");
  const [response, setResponse] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [editSources, setEditSources] = useState<string>("");
  const [aiModel, setAiModel] = useState("");
  const [contextInputs, setContextInputs] = useState<ContextInputs>({
    paragraph_content: "",
    writing_style: "",
    task: "",
    user_context: "",
  });

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
    const fetchChats = async () => {
      if (activeParagraphId === null) return;

      try {
        const response = await axios.get<Chat[]>(
          `http://localhost:8000/paragraphs/${activeParagraphId}/chats`
        );
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [activeParagraphId]);

  const updateSources = async () => {
    if (!project) return;

    try {
      await axios.put(
        `http://localhost:8000/projects/${project.id}`,
        { sources_json: editSources },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Sources updated successfully!");
    } catch (error) {
      console.error("Error updating sources:", error);
    }
  };

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
      setNewParagraphContent(""); // Clear the input field
    } catch (error) {
      console.error("Error creating paragraph:", error);
    }
  };

  const handleParagraphClick = (paragraphId: number) => {
    setActiveParagraphId(paragraphId);
  };

  const handleSend = async () => {
    if (userPrompt.trim() === "" || aiModel === "") {
      alert("Please enter a question and choose a model.");
      return;
    }

    const requestBody: ChatRequest = {
      user_prompt: userPrompt,
      ai_model: aiModel,
      context_inputs: contextInputs,
    };

    console.log(userPrompt);
    console.log(systemInfo);
    console.log(aiModel);

    try {
      const res = await axios.post<ChatResponse>(
        "http://localhost:8000/aiChat",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error occurred while fetching the response.");
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContextInputs({ ...contextInputs, [e.target.name]: e.target.value });
  };

  const handleSaveChat = async () => {
    if (response.trim() === "") {
      alert("No response to save.");
      return;
    }

    if (activeParagraphId === null) {
      alert("No paragraph selected.");
      return;
    }

    const chatData = {
      title: "Cooler Titel", // Adjust title dynamically if necessary
      aiModel: "llama3.2",
      content_json: JSON.stringify({
        user_prompt: userPrompt,
        response: response,
      }),
      paragraph_id: activeParagraphId,
    };

    try {
      await axios.post("http://localhost:8000/chats", chatData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Chat saved successfully!");
    } catch (error) {
      console.error("Error saving chat:", error);
      alert("Error occurred while saving the chat.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>Project View for Project ID: {id}</h2>
      {project ? (
        <div>
          <h3>{project.title}</h3>
          <textarea
            value={editSources}
            onChange={(e) => setEditSources(e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />
          <button onClick={updateSources}>
            Update Sources(geht noch nicht weil backend funktionalität fehlt)
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <h3>Paragraphs</h3>
      <ul>
        {paragraphs.map((paragraph) => (
          <li
            key={paragraph.id}
            onClick={() => handleParagraphClick(paragraph.id)}
          >
            {paragraph.content_json}
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
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            padding: "10px",
            width: "300px",
          }}
        >
          <h3>AI Chat for Paragraph ID: {activeParagraphId}</h3>
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter your question"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            value={systemInfo}
            onChange={(e) => setSystemInfo(e.target.value)}
            placeholder="Enter context information"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            placeholder="Choose a Model"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="paragraph_content"
            value={contextInputs.paragraph_content}
            onChange={handleContextChange}
            placeholder="Enter paragraph content"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="writing_style"
            value={contextInputs.writing_style}
            onChange={handleContextChange}
            placeholder="Enter writing style"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="task"
            value={contextInputs.task}
            onChange={handleContextChange}
            placeholder="Enter task"
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="user_context"
            value={contextInputs.user_context}
            onChange={handleContextChange}
            placeholder="Enter user context"
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleSend}>Send</button>
          <div style={{ marginTop: "20px" }}>
            {response && `AI Response: ${response}`}
          </div>
          <button onClick={handleSaveChat}>Save answer</button>

          <h4>Saved Chats:</h4>
          <ul>
            {chats.map((chat) => (
              <li key={chat.id}>
                {JSON.parse(chat.content_json).user_prompt} -{" "}
                {JSON.parse(chat.content_json).response}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
