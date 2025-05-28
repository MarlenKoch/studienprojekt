import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chat } from "../types/Chat";
import { ChatRequest } from "../types/ChatRequest";
import { ChatResponse } from "../types/ChatResponse";
import ReactMarkdown from "react-markdown";
import { useProjectTimer } from "../context/ProjectTimerContext";

// Das Backend liefert/konsumiert diese Felder!
interface Answer {
  id?: number;
  chat_id?: number;
  task: string; // User-Eingabe
  ai_answer: string; // AI-Antwort
  user_note: string; // (optional)
  created_at?: string;
}

interface ChatComponentProps {
  paragraphId: number | null;
  aiModelList: string[];
  mode?: number;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  paragraphId,
  aiModelList,
}) => {
  const [systemInfo, setSystemInfo] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [aiModel, setAiModel] = useState(aiModelList[0] || "");
  const [task, setTask] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [userContext, setUserContext] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isNewChatActive, setIsNewChatActive] = useState(false);
  const { currentMode } = useProjectTimer();

  // ========== Chat/Answers laden ==========

  const fetchChats = async () => {
    if (paragraphId === null) return;
    try {
      const response = await axios.get<Chat[]>(
        `http://localhost:8000/paragraphs/${paragraphId}/chats`
      );
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchAnswers = async (chatId: number) => {
    try {
      const resp = await axios.get<Answer[]>(
        `http://localhost:8000/chats/${chatId}/answers/`
      );
      setAnswers(
        resp.data.sort(
          (a, b) =>
            new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
        )
      );
    } catch (err) {
      console.error(err);
      setAnswers([]);
    }
  };

  // ========== Lifecycle Effekt: Paragraph wechseln oder Modus switchen ==========

  useEffect(() => {
    fetchChats();
    setAnswers([]);
    setActiveChat(null);
    setIsNewChatActive(false);
    setChatTitle("");
    setAiModel(aiModelList[0] || "");
    setTask("");
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
  }, [paragraphId]);

  // Sofort auf "readonly" schalten, wenn Modus 3 (auch im laufenden Betrieb!)
  useEffect(() => {
    if (currentMode === 3) {
      setUserPrompt("");
    }
  }, [currentMode]);

  useEffect(() => {
    if (activeChat && activeChat.id) {
      fetchAnswers(activeChat.id);
    } else if (!isNewChatActive) {
      setAnswers([]);
    }
  }, [activeChat, isNewChatActive]);

  // ========== Hauptfunktionen ==========

  const handleSend = async () => {
    if (currentMode === 3) return; // Sicherheit
    if (paragraphId === null) {
      alert("paragraph ID is missing.");
      return;
    }
    if (!userPrompt.trim()) {
      alert("Bitte gib eine Frage ein.");
      return;
    }

    const newAnswer: Answer = {
      task: userPrompt,
      ai_answer: "",
      user_note: "",
    };

    // AI request bauen
    const requestBody: ChatRequest = {
      user_prompt: { task, user_prompt: userPrompt },
      ai_model: aiModel,
      context_inputs: {
        paragraph_content: "",
        writing_style: writingStyle,
        user_context: userContext,
        previous_chat_json: JSON.stringify({
          answers: answers.map((ans) => ({
            task: ans.task,
            ai_answer: ans.ai_answer,
            user_note: ans.user_note,
          })),
        }),
      },
    };

    try {
      const paragraphResponse = await axios.get(
        `http://localhost:8000/paragraphs/${paragraphId}`
      );
      requestBody.context_inputs.paragraph_content =
        paragraphResponse.data.content_json;
    } catch (error) {
      console.error("Error fetching the paragraph:", error);
    }

    try {
      const aiResponse = await axios.post<ChatResponse>(
        "http://localhost:8000/aiChat",
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      const answerWithResponse: Answer = {
        ...newAnswer,
        ai_answer: aiResponse.data.response,
      };

      // "messages" analog: Zeigt direkt in der UI
      const updatedAnswers = [...answers, answerWithResponse];
      setAnswers(updatedAnswers);

      // ----- AUTO-SAVE im Schülermodus -----
      if (currentMode === 1 || currentMode === 2) {
        await saveChatWithAnswers(updatedAnswers);
      }

      setUserPrompt("");
    } catch (error) {
      console.error("Error:", error);
      alert("Error occurred while getting AI response.");
    }
  };

  // ========== SPEICHERN Chat + Answers ==========
  // Hilfsfunktion, da für auto-save & Button benötigt!
  const saveChatWithAnswers = async (answersToSave?: Answer[]) => {
    const _answers = answersToSave || answers;

    if (_answers.length === 0 || chatTitle.trim() === "" || !paragraphId) {
      alert("Please provide all necessary information.");
      return;
    }

    // Chat speichern (neu oder update)
    let chatId: number | undefined = activeChat?.id;
    let chatResp: Chat | null = null;

    if (!activeChat) {
      try {
        const chatData = {
          title: chatTitle || "Schüler-Chat",
          aiModel: aiModel,
          task,
          paragraph_id: paragraphId,
          //content_json: "", // Wird noch gebraucht...
        };
        const saveResp = await axios.post<Chat>(
          "http://localhost:8000/chats",
          chatData,
          { headers: { "Content-Type": "application/json" } }
        );
        chatResp = saveResp.data;
        chatId = chatResp.id;
        setActiveChat(chatResp);
      } catch (error) {
        console.error("Fehler beim Speichern des Chats", error);
        alert("Fehler beim Speichern des Chats");
        return;
      }
    } else {
      chatId = activeChat.id;
      try {
        const chatData = {
          title: chatTitle || "Schüler-Chat",
          aiModel: aiModel,
          task,
          paragraph_id: paragraphId,
          //content_json: "",
        };
        await axios.put(`http://localhost:8000/chats/${chatId}`, chatData, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Chats", error);
      }
    }

    // Answers speichern
    if (chatId) {
      let changed = false;
      for (const answer of _answers) {
        if (!answer.id) {
          try {
            await axios.post("http://localhost:8000/answers/", {
              chat_id: chatId,
              task: answer.task,
              ai_answer: answer.ai_answer,
              user_note: answer.user_note,
            });
            changed = true;
          } catch (error) {
            console.error("Fehler beim Abspeichern einer Answer:", error);
          }
        }
      }
      if (changed) await fetchAnswers(chatId);
      fetchChats();
      if (!answersToSave) alert("Chat und Antworten gespeichert!");
    }
    setIsNewChatActive(false);
  };

  // ========== Nutzeraktionen für Ansicht & Button ==========

  const handleSaveChat = () => saveChatWithAnswers();

  const handleChatTitleClick = (chat: Chat) => {
    setActiveChat(chat);
    setIsNewChatActive(false);
    setChatTitle(chat.title);
    setAiModel(chat.aiModel);
    setTask(chat.task);
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
    fetchAnswers(chat.id);
  };

  const handleNewChat = () => {
    setIsNewChatActive(true);
    setActiveChat(null);
    setAnswers([]);
    setChatTitle("blub test");
    setAiModel(aiModelList[0] || "");
    setTask("");
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
  };

  // ========== RENDER ==========

  return (
    <div
      style={{
        marginTop: "20px",
        border: "1px solid #ccc",
        padding: "10px",
        width: "300px",
      }}
    >
      <h3>AI Chat for Paragraph ID: {paragraphId}</h3>

      {(currentMode === 0 || currentMode === 1 || currentMode === 2) && (
        <button onClick={handleNewChat}>New Chat</button>
      )}

      {(activeChat || isNewChatActive) && (
        <>
          <div>
            {answers.map((ans, index) => (
              <div key={ans.id ?? `local-${index}`}>
                <strong>User:</strong> {ans.task}
                <br />
                <strong>AI:</strong>
                <ReactMarkdown>{ans.ai_answer}</ReactMarkdown>
                <br />
                {ans.user_note && (
                  <>
                    <strong>Kommentar:</strong> {ans.user_note}
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Felder nur wenn nicht Modus 3 */}
          {currentMode !== 3 && (
            <>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your question"
                disabled={currentMode === 3}
              />
              <input
                type="text"
                value={systemInfo}
                onChange={(e) => setSystemInfo(e.target.value)}
                placeholder="Enter system information"
                disabled
              />
              <label>Choose a Model:</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                disabled={currentMode === 3}
              >
                {aiModelList.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                placeholder="Enter writing style"
                disabled={currentMode === 3}
              />
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task"
                disabled={currentMode === 3}
              />
              <input
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Enter user context"
                disabled={currentMode === 3}
              />
              <button onClick={handleSend} disabled={currentMode === 3}>
                Send
              </button>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Enter title to save the chat"
                disabled={currentMode === 3}
              />
              <button onClick={handleSaveChat} disabled={currentMode === 3}>
                Save Chat
              </button>
            </>
          )}
        </>
      )}
      <h4>Saved Chats:</h4>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => handleChatTitleClick(chat)}
            style={{
              cursor: "pointer",
            }}
          >
            <h6>{chat.title}</h6>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatComponent;
