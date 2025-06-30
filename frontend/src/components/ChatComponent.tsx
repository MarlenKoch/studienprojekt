import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chat } from "../types/Chat";
import { Answer } from "../types/Answer";
import { AiRequest } from "../types/AiRequest";
import { AiResponse } from "../types/AiResponse";
import ReactMarkdown from "react-markdown";
import { useProjectTimer } from "../context/ProjectTimerContext";
import Switch from "react-switch";
import { toast } from "react-toastify";

interface ChatComponentProps {
  paragraphId: number | null;
  aiModelList: string[];
  mode?: number;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  paragraphId,
  aiModelList,
}) => {
  const [chatTitle, setChatTitle] = useState("");
  const [aiModel, setAiModel] = useState(aiModelList[0] || "");
  const [task, setTask] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [userContext, setUserContext] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isNewChatActive, setIsNewChatActive] = useState(false);
  const { currentMode } = useProjectTimer();
  const [isShowingSynonym, setIsShowingSynonym] = useState(false);
  const [synonym, setSynonym] = useState("");

  // States für das Kommentar-Popup
  const [openNoteAnswerIndex, setOpenNoteAnswerIndex] = useState<number | null>(
    null
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [userNoteEnabledDraft, setUserNoteEnabledDraft] = useState(false); // <-- NEU
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isInfoPopUpOpen, setIsInfoPopUpOpen] = useState(false);

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
            new Date(a.timestamp || "").getTime() -
            new Date(b.timestamp || "").getTime()
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
    setTask(0);
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
    setSynonym("");
  }, [paragraphId]);

  useEffect(() => {
    if (activeChat && activeChat.id) {
      fetchAnswers(activeChat.id);
    } else if (!isNewChatActive) {
      setAnswers([]);
    }
  }, [activeChat, isNewChatActive]);

  useEffect(() => {
    if (task === 4 || task === 6 || task === 8 || task === 5)
      setAiModel("gemma3:12b");
    else if (task === 1 || task === 3)
      setAiModel("jobautomation/OpenEuroLLM-German");
    else if (task === 2) setAiModel("mayflowergmbh/wiederchat");
    if (task === 4) setIsShowingSynonym(true);
    else setIsShowingSynonym(false);
  }, [task]);

  // ========== Hauptfunktionen ==========

  const handleSend = async () => {
    if (currentMode === 3) return; // Sicherheit
    if (paragraphId === null) {
      toast.warn("paragraph ID is missing.");
      return;
    }
    if (task === 0 || (task === 8 && currentMode != 0)) {
      toast.warn("Bitte wähle ine zulässige Anfrage!");
      return;
    }

    const newAnswer: Answer = {
      task: task,
      aiAnswer: "",
      userNote: "",
      userNoteEnabled: false,
      aiModel: aiModel,
      userPrompt: userPrompt,
      timestamp: Date.now(),
    };

    // AI request bauen
    const requestBody: AiRequest = {
      userPrompt: { task, userPrompt, ...(task === 4 && { synonym }) },
      aiModel: aiModel,
      context: {
        paragraphContent: "",
        writingStyle: writingStyle,
        userContext: userContext,
        previousChatJson: JSON.stringify({
          answers: answers.map((ans) => ({
            task: ans.task,
            aiAnswer: ans.aiAnswer,
            userNote: ans.userNoteEnabled ? ans.userNote : "", //TODO nur übergebn wenn... (erledigt)
          })),
        }),
      },
    };

    try {
      const paragraphResponse = await axios.get(
        `http://localhost:8000/paragraphs/${paragraphId}`
      );
      requestBody.context.paragraphContent = paragraphResponse.data.content;
    } catch (error) {
      console.error("Error fetching the paragraph:", error);
    }

    try {
      const aiResponse = await axios.post<AiResponse>(
        "http://localhost:8000/aiChat",
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      const answerWithResponse: Answer = {
        ...newAnswer,
        aiAnswer: aiResponse.data.response,
      };

      const updatedAnswers = [...answers, answerWithResponse];
      setAnswers(updatedAnswers);

      // ----- AUTO-SAVE im Schülermodus -----
      if (currentMode === 1 || currentMode === 2) {
        await saveChatWithAnswers(updatedAnswers);
      }

      setUserPrompt("");
    } catch (error) {
      console.error("Error:", error);
      toast.warn("Error occurred while getting AI response.");
    }
  };

  // ========== SPEICHERN Chat + Answers ==========
  // Hilfsfunktion, da für auto-save & Button benötigt!
  const saveChatWithAnswers = async (answersToSave?: Answer[]) => {
    const _answers = answersToSave || answers;

    if (_answers.length === 0 || chatTitle.trim() === "" || !paragraphId) {
      toast.warn("Please provide all necessary information.");
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
          paragraphId: paragraphId,
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
        toast.warn("Fehler beim Speichern des Chats");
        return;
      }
    } else {
      chatId = activeChat.id;
      try {
        const chatData = {
          title: chatTitle || "Schüler-Chat",
          aiModel: aiModel,
          task,
          paragraphId: paragraphId,
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
              chatId: chatId,
              task: answer.task,
              aiAnswer: answer.aiAnswer,
              userNote: answer.userNote,
              userNoteEnabled: answer.userNoteEnabled,
              aiModel: answer.aiModel,
              timestamp: answer.timestamp,
              userPrompt: answer.userPrompt,
            });
            changed = true;
          } catch (error) {
            console.error("Fehler beim Abspeichern einer Answer:", error);
          }
        }
      }
      if (changed) await fetchAnswers(chatId);
      fetchChats();
      if (!answersToSave) toast.warn("Chat und Antworten gespeichert!");
    }
    setIsNewChatActive(false);
  };

  // ========== Nutzeraktionen für Ansicht & Button ==========

  const handleChatTitleClick = (chat: Chat) => {
    setActiveChat(chat);
    setIsNewChatActive(false);
    setChatTitle(chat.title);
    setAiModel("");
    setTask(0);
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
    setTask(0);
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
    setSynonym("");
  };

  const taskOptions = [
    { id: 1, label: "umformulieren" },
    { id: 2, label: "zusammenfassen" },
    { id: 3, label: "Text aus Stichpunkten" },
    { id: 4, label: "Synonyme finden" },
    { id: 5, label: "Grammatik und Rechtschreibung prüfen" },
    { id: 6, label: "Feedback geben" },
    { id: 7, label: "erklären" },
    { id: 8, label: "eigener Prompt" },
  ];

  const filteredTaskOptions =
    currentMode === 1 || currentMode === 2
      ? taskOptions.filter((opt) => opt.label !== "eigener Prompt")
      : taskOptions;
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
      <p>{currentMode}</p>

      {(activeChat || isNewChatActive) && (
        <>
          <div>
            {answers.map((ans, index) => (
              <div key={ans.id ?? `local-${index}`}>
                <strong>User:</strong> {ans.task}
                <br />
                <strong>AI:</strong>
                <span
                  style={{
                    cursor: currentMode !== 3 ? "pointer" : "default",
                    color: currentMode !== 3 ? "white" : "inherit",
                  }}
                  onClick={
                    currentMode !== 3
                      ? () => {
                          setOpenNoteAnswerIndex(index);
                          setNoteDraft(ans.userNote || "");
                          setUserNoteEnabledDraft(ans.userNoteEnabled);
                        }
                      : undefined
                  }
                  title={
                    currentMode !== 3 ? "Kommentar hinzufügen/bearbeiten" : ""
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // So button doesn't trigger parent click
                      navigator.clipboard.writeText(ans.aiAnswer || "");
                    }}
                  >
                    📋
                  </button>
                  <ReactMarkdown>{ans.aiAnswer}</ReactMarkdown>
                </span>
                {/* <br />
                {ans.user_note && (
                  <>
                    <strong>Kommentar:</strong> {ans.user_note}
                  </>
                )} */}
              </div>
            ))}
          </div>
          {/* Edit-Kommentar Popup */}
          {openNoteAnswerIndex !== null && (
            <>
              {/* Hintergrund-Overlay */}
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.15)",
                  zIndex: 9000,
                }}
                onClick={() => setOpenNoteAnswerIndex(null)}
              />
              {/* Popup-Box */}
              <div
                style={{
                  position: "fixed",
                  top: "30%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "white",
                  border: "2px solid #333",
                  borderRadius: "10px",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
                  zIndex: 9999,
                  padding: "24px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4>Kommentar bearbeiten</h4>
                <textarea
                  rows={5}
                  style={{ width: "100%" }}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  disabled={isSavingNote}
                />
                <div style={{ margin: "10px 0" }}>
                  <label style={{ marginRight: 10 }}>
                    Kommentar aktivieren:
                  </label>
                  <Switch
                    checked={userNoteEnabledDraft}
                    onChange={setUserNoteEnabledDraft}
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={async () => {
                      setIsSavingNote(true);
                      try {
                        const answerToUpdate = answers[openNoteAnswerIndex];
                        const newAnswers = [...answers];
                        newAnswers[openNoteAnswerIndex] = {
                          ...answerToUpdate,
                          userNote: noteDraft,
                          userNoteEnabled: userNoteEnabledDraft,
                        };
                        setAnswers(newAnswers);
                        if (answerToUpdate.id) {
                          await axios.put(
                            `http://localhost:8000/answers/${answerToUpdate.id}`,
                            {
                              ...answerToUpdate,
                              userNote: noteDraft,
                              userNoteEnabled: userNoteEnabledDraft,
                            },
                            { headers: { "Content-Type": "application/json" } }
                          );
                        }
                        setOpenNoteAnswerIndex(null);
                      } catch (err) {
                        toast.warn("Fehler beim Speichern des Kommentars");
                        console.error(err);
                      }
                      setIsSavingNote(false);
                    }}
                    disabled={isSavingNote}
                  >
                    Speichern
                  </button>
                  <button
                    style={{ marginLeft: 10 }}
                    onClick={() => setOpenNoteAnswerIndex(null)}
                    disabled={isSavingNote}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </>
          )}
          {/* Felder nur wenn nicht Modus 3 */}
          {currentMode !== 3 && (
            <>
              {currentMode === 0 && (
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Enter your question"
                />
              )}

              <label>Choose a Model:</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
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
                placeholder="Enter text style"
              />
              <select
                value={task}
                onChange={(e) => setTask(Number(e.target.value))}
              >
                <option value="">Select task</option>
                {filteredTaskOptions.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              {isShowingSynonym && (
                <input
                  type="text"
                  value={synonym}
                  onChange={(e) => setSynonym(e.target.value)}
                  placeholder="Enter synonyms"
                />
              )}
              <input
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Enter user context"
              />
              <button onClick={handleSend}>Send</button>
              <button onClick={() => setIsInfoPopUpOpen(true)}>
                Open Popup
              </button>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Enter title to save the chat"
              />
              <button onClick={() => saveChatWithAnswers()}>Save Chat</button>
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
      {isInfoPopUpOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.15)",
              zIndex: 9000,
            }}
            onClick={() => setIsInfoPopUpOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "red",
              padding: 24,
              border: "2px solid #333",
              borderRadius: 10,
              zIndex: 9999,
              minWidth: 200,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              AI Warnung: AI kann falsche Informationen geben und Haluzinieren.
              Überprüfe Informationen. PÜ.
            </p>
            <button onClick={() => setIsInfoPopUpOpen(false)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;
