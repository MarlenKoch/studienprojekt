import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chat } from "../../types/Chat";
import { Answer } from "../../types/Answer";
import { AiRequest } from "../../types/AiRequest";
import { AiResponse } from "../../types/AiResponse";
import ReactMarkdown from "react-markdown";
import { useProjectTimer } from "../../context/ProjectTimerContext";
import Switch from "react-switch";
import { toast } from "react-toastify";
import { Splitter, SplitterPanel } from "primereact/splitter";
// import styles from "./Chat.module.css";
import chatStyles from "./Chat.module.css";

interface ChatComponentProps {
  paragraphId: number | null;
  aiModelList: string[];
  projectId: number | undefined;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  paragraphId,
  aiModelList,
  projectId,
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
              projectId: projectId,
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

  const handleDeleteChat = async (chatId: number) => {
    try {
      // Den Chat löschen
      await axios.delete(`http://localhost:8000/chats/${chatId}`);
      fetchChats();
    } catch (error) {
      toast.error("Fehler beim Löschen eines Chats oder dessen Answers.");
      console.error(error);
    }
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
    <div className={chatStyles.wrapper}>
      <Splitter
        key={activeChat || isNewChatActive ? "open-2" : "closed-2"}
        className={chatStyles.splitter}
        style={{
          height: "100%",
          width: "100%",
        }}
        gutterSize={activeChat || isNewChatActive ? 5 : 0}
      >
        <SplitterPanel
          size={activeChat || isNewChatActive ? 50 : 100000}
          style={{
            height: "100%",
            flex: activeChat || isNewChatActive ? 1 : 2,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            // minWidth: 200,
            width: "100%",
          }}
          className={chatStyles.sectionCard}
        >
          <div className={chatStyles.heading}>
            AI Chat für Paragraph-ID: {paragraphId}
          </div>
          {(currentMode === 0 || currentMode === 1 || currentMode === 2) && (
            <button className={chatStyles.btn} onClick={handleNewChat}>
              + Neuer Chat
            </button>
          )}
          <h4 style={{ marginTop: "17px" }}>Gespeicherte Chats</h4>
          <div className={chatStyles.scrollableContainer}>
            <ul className={chatStyles.chatList}>
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleChatTitleClick(chat)}
                  className={activeChat?.id === chat.id ? "active" : ""}
                >
                  <span>{chat.title}</span>
                  {currentMode === 0 && (
                    <button
                      className={chatStyles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      🗑
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </SplitterPanel>
        <SplitterPanel
          size={activeChat || isNewChatActive ? 1 : 0}
          style={{
            height: "100%",
            flex: activeChat || isNewChatActive ? 1 : 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            //minWidth: activeChat || isNewChatActive ? 450 : 0,
            width: "100%",
          }}
          className={
            activeChat || isNewChatActive
              ? chatStyles.sectionCard
              : chatStyles.none
          }
        >
          {(activeChat || isNewChatActive) && (
            <>
              {/* Answers */}
              <div
                className={chatStyles.scrollableContainer}
                style={{ marginBottom: "13px" }}
              >
                {answers.map((ans, index) => (
                  <div
                    key={ans.id ?? `local-${index}`}
                    className={chatStyles.answerBlock}
                  >
                    <div>
                      <strong>User:</strong> {ans.task}
                      <br />
                      <strong>AI:</strong>
                      <span
                        style={{
                          cursor: currentMode !== 3 ? "pointer" : "default",
                          color: currentMode !== 3 ? "#505087" : "inherit",
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
                          currentMode !== 3
                            ? "Kommentar hinzufügen/bearbeiten"
                            : ""
                        }
                      >
                        <button
                          className={chatStyles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(ans.aiAnswer || "");
                          }}
                        >
                          📋
                        </button>
                        <span className="markdown">
                          <ReactMarkdown>{ans.aiAnswer}</ReactMarkdown>
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Kommentar Popup */}
              {openNoteAnswerIndex !== null && (
                <>
                  <div
                    className={chatStyles.answerNotePopBg}
                    onClick={() => setOpenNoteAnswerIndex(null)}
                  />
                  <div
                    className={chatStyles.answerNotePopContent}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4>Kommentar bearbeiten</h4>
                    <textarea
                      rows={5}
                      className={chatStyles.textarea}
                      style={{ width: "100%" }}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      disabled={isSavingNote}
                    />
                    <div style={{ margin: "10px 0" }}>
                      <label className={chatStyles.label}>
                        Kommentar aktivieren:
                      </label>
                      <Switch
                        checked={userNoteEnabledDraft}
                        onChange={setUserNoteEnabledDraft}
                      />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button
                        className={chatStyles.btn}
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
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                }
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
                        className={[chatStyles.btn, chatStyles.cancel].join(
                          " "
                        )}
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
                <div style={{ marginTop: "20px" }}>
                  <div className={chatStyles.chatControlRow}>
                    {currentMode === 0 && (
                      <input
                        className={chatStyles.field}
                        type="text"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Deine Frage an die KI"
                      />
                    )}

                    <label className={chatStyles.label}>Modell:</label>
                    <select
                      className={chatStyles.taskSelector}
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
                      className={chatStyles.field}
                      type="text"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      placeholder="Stil (optional)"
                    />

                    <select
                      className={chatStyles.taskSelector}
                      value={task}
                      onChange={(e) => setTask(Number(e.target.value))}
                    >
                      <option value="">Task wählen</option>
                      {filteredTaskOptions.map(({ id, label }) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {isShowingSynonym && (
                      <input
                        className={`${chatStyles.field} ${chatStyles.syninput}`}
                        type="text"
                        value={synonym}
                        onChange={(e) => setSynonym(e.target.value)}
                        placeholder="Wort/Synonym"
                      />
                    )}
                    <input
                      className={chatStyles.field}
                      type="text"
                      value={userContext}
                      onChange={(e) => setUserContext(e.target.value)}
                      placeholder="Zusatztipp o. Kontext"
                    />
                  </div>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "14px" }}
                  >
                    <button className={chatStyles.btn} onClick={handleSend}>
                      AI Antwort anfordern
                    </button>
                    <input
                      className={chatStyles.field}
                      type="text"
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      placeholder="Chat-Titel"
                    />
                    <button
                      className={chatStyles.btn}
                      onClick={() => saveChatWithAnswers()}
                    >
                      Chat speichern
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SplitterPanel>
      </Splitter>
      {isInfoPopUpOpen && (
        <>
          <div
            className={chatStyles.answerNotePopBg}
            onClick={() => setIsInfoPopUpOpen(false)}
          />
          <div
            className={chatStyles.answerNotePopContent}
            style={{ background: "#f9dede" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              <b>AI Warnung:</b> Die AI kann auch falsche Informationen liefern.
              Bitte eigenständig den Output prüfen.
            </p>
            <button
              className={chatStyles.btn}
              onClick={() => setIsInfoPopUpOpen(false)}
            >
              Schließen
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;
