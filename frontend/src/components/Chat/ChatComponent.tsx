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
import chatStyles from "./Chat.module.css";
import Tooltip from "../Tooltip/Tooltip";
import InfoTip from "../InfoTip/InfoTip";
import TextareaAutosize from "react-textarea-autosize";

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
  const [isEditingChatTitle, setIsEditingChatTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // States für das Kommentar-Popup
  const [openNoteAnswerIndex, setOpenNoteAnswerIndex] = useState<number | null>(
    null
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [userNoteEnabledDraft, setUserNoteEnabledDraft] = useState(false); // <-- NEU
  const [isSavingNote, setIsSavingNote] = useState(false);
  // const [isInfoPopUpOpen, setIsInfoPopUpOpen] = useState(false);

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
    if (task === 4 || task === 6 || task === 8 || task === 5 || task === 7)
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
      console.error("ID des Absatzes fehlt");
      return;
    }
    if (task === 0 || (task === 8 && currentMode != 0)) {
      toast.warn("Bitte wähle eine zulässige Anfrage!");
      return;
    }

    toast.success("Anfrage gesendet");
    setIsLoading(true);

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
      toast.warn("Beim generieren der KI-Antwort ist ein Fehler aufgetreten");
    } finally {
      setIsLoading(false); // auch wenn error weg
    }
  };

  // ========== SPEICHERN Chat + Answers ==========
  // Hilfsfunktion, da für auto-save & Button benötigt!
  const saveChatWithAnswers = async (answersToSave?: Answer[]) => {
    const _answers = answersToSave || answers;

    if (_answers.length === 0 || chatTitle.trim() === "" || !paragraphId) {
      toast.warn("Bitte fülle die notwendigen Felder");
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
    setChatTitle("Chat");
    setAiModel(aiModelList[0] || "");
    setTask(0);
    setWritingStyle("");
    setUserContext("");
    setUserPrompt("");
    setSynonym("");
  };

  const writingStyles = [
    { value: "", label: "Schreibstil (optional)" },
    { value: "Sachlich", label: "Sachlich" },
    { value: "Emotional", label: "Emotional" },
    { value: "Humorvoll", label: "Humorvoll" },
    { value: "Ironisch", label: "Ironisch" },
    { value: "Lyrisch", label: "Lyrisch" },
    { value: "Journalistisch", label: "Journalistisch" },
    { value: "Wissenschaftlich", label: "Wissenschaftlich" },
    { value: "Umgangssprachlich", label: "Umgangssprachlich" },
    { value: "Erzählerisch (narrativ)", label: "Erzählerisch (narrativ)" },
    { value: "Dramatisch", label: "Dramatisch" },
    { value: "Satirisch", label: "Satirisch" },
    { value: "Minimalistisch", label: "Minimalistisch" },
    { value: "Persuasiv", label: "Persuasiv" },
  ];

  const handleDeleteChat = async (chatId: number) => {
    try {
      // Den Chat löschen
      await axios.delete(`http://localhost:8000/chats/${chatId}`);
      fetchChats();
    } catch (error) {
      toast.error("Fehler beim Löschen eines Chats oder dessen Antworten.");
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

  const handleSaveNote = async () => {
    if (typeof openNoteAnswerIndex !== "number") return;
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
  };

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
            flexDirection: "row",
            width: "100%",
            paddingRight: activeChat || isNewChatActive ? "0px" : "24px",

            alignItems: "center",
          }}
          className={chatStyles.sectionCard}
        >
          <div
            style={{
              flex: 1,
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              gap: "12px",
              minWidth: 0,
            }}
          >
            {(currentMode === 0 || currentMode === 1 || currentMode === 2) && (
              <div>
                <InfoTip
                  top={true}
                  text="Wenn ein KI-Chat zu einem Absatz erstellt wird, wird dem KI-Modell bei Anfragen der Inhalt des Absatzes mitgegeben, sodass es diesen Inhalt für die Antwort verwenden kann. Damit kann z.B. ein Absatze umformuliert oder zusammengefasst werden."
                >
                  <button className={chatStyles.btn} onClick={handleNewChat}>
                    + Neuer Chat
                  </button>
                </InfoTip>
              </div>
            )}
            <div className={chatStyles.scrollableContainer}>
              <ul className={chatStyles.chatList}>
                {chats.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => handleChatTitleClick(chat)}
                    className={[
                      chatStyles.chatItem,
                      activeChat?.id === chat.id && "active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className={chatStyles.chatTitle} title={chat.title}>
                      {chat.title}
                    </div>
                    {currentMode === 0 && (
                      <Tooltip text="Diesen Chat löschen">
                        <button
                          className={chatStyles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                        >
                          🗑
                        </button>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {(activeChat || isNewChatActive) && (
            <Tooltip text="Seitenleiste schließen">
              <button
                style={{
                  margin: 0,
                  padding: 0,
                  background: "none",
                }}
                onClick={() => {
                  setActiveChat(null);
                  setIsNewChatActive(false);
                }}
              >
                {"◀"}
              </button>
            </Tooltip>
          )}
        </SplitterPanel>
        <SplitterPanel
          size={activeChat || isNewChatActive ? 1 : 0}
          style={{
            height: "100%",
            flex: activeChat || isNewChatActive ? 1 : 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
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
              {" "}
              {isLoading && (
                <div className={chatStyles.loadingOverlay}>
                  <div className={chatStyles.loader}></div>
                  <div className={chatStyles.loadingText}>
                    KI wird befragt...
                  </div>
                </div>
              )}
              {/* Chat-Verlauf/Fragen & Antworten (WhatsApp-Style) */}
              <div className={chatStyles.bubbleChatContainer}>
                {answers.map((ans, i) => (
                  <React.Fragment key={ans.id ?? `local-${i}`}>
                    {/* User-Frage als Sprechblase (rechts) */}
                    <div className={chatStyles.bubbleRowRight}>
                      <div
                        className={
                          chatStyles.bubble + " " + chatStyles.userBubble
                        }
                      >
                        <div className={chatStyles.bubbleMeta}>
                          <span className={chatStyles.bubbleAvatar}>👤</span>
                          <span>
                            {taskOptions.find((t) => t.id === ans.task)?.label}
                          </span>
                        </div>
                        <div className={chatStyles.bubbleText}>
                          {ans.userPrompt}
                        </div>
                      </div>
                    </div>
                    {/* AI-Antwort als Sprechblase (links) */}
                    <div className={chatStyles.bubbleRowLeft}>
                      <div
                        className={
                          chatStyles.bubble + " " + chatStyles.aiBubble
                        }
                      >
                        <div className={chatStyles.bubbleMeta}>
                          <div className={chatStyles.bubbleMetaSideContainer}>
                            <span className={chatStyles.bubbleAvatar}>🤖</span>
                            <span>{ans.aiModel}</span>
                          </div>
                          <div className={chatStyles.bubbleMetaSideContainer}>
                            <Tooltip text="Antwort kopieren">
                              <button
                                className={chatStyles.copyBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    ans.aiAnswer || ""
                                  );
                                }}
                              >
                                📋
                              </button>
                            </Tooltip>
                            {currentMode !== 3 && (
                              <Tooltip text="Kommentieren">
                                <button
                                  className={chatStyles.copyBtn}
                                  onClick={() => {
                                    setOpenNoteAnswerIndex(i);
                                    setNoteDraft(ans.userNote || "");
                                    setUserNoteEnabledDraft(
                                      ans.userNoteEnabled
                                    );
                                  }}
                                >
                                  💬
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <div className={chatStyles.bubbleText}>
                          <span
                            style={{
                              cursor: currentMode !== 3 ? "pointer" : "default",
                            }}
                            title={
                              currentMode !== 3
                                ? "Kommentar hinzufügen/bearbeiten"
                                : ""
                            }
                          >
                            <div className={chatStyles.markdown}>
                              <ReactMarkdown>{ans.aiAnswer}</ReactMarkdown>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {/* Aufgaben-Auswahl und Absenden-Button */}
              {currentMode !== 3 && (
                <div className={chatStyles.chatControlBox}>
                  <div className={chatStyles.controlRow}>
                    <InfoTip text="Je nach gewählter Aufgabe bekommt das KI-Modell eine andere Aufgabenstellung. Dieser sogenannte Prompt wird im Hintergrund zusammengesetzt und sagt der KI, wie sie antworten soll. Der Prompt umfasst sowohl das gewünschte Format der Antwort, z.B. Stichpunkte oder Fließtext, als auch Hinweise zum Inhalt.">
                      <select
                        className={chatStyles.taskSelector}
                        value={task}
                        onChange={(e) => setTask(Number(e.target.value))}
                      >
                        <option value="">Aufgabe wählen</option>
                        {filteredTaskOptions.map(({ id, label }) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </InfoTip>
                    <InfoTip text="Jetzt werden im Hintergrund alle Informationen (die Aufgabenstellung, der gewünschte Schreibstil, der Inhalt des Absatzes zu dem der Chat erstellt wurde, wenn vorhanden der bisherige Chatverlauf und der Nutzerkommentar) zusammengesetzt und dem KI-Modell übergeben. Desto mehr Kontextinformationen dieses hat, desto passender wird die generierte Antwort.">
                      <button
                        className={chatStyles.sendBtn}
                        onClick={handleSend}
                      >
                        <img
                          src="/logo.png"
                          alt="🚀"
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    </InfoTip>
                  </div>

                  {/* Zusätzliche Anpassungsfelder */}
                  <div className={chatStyles.controlRowFields}>
                    <InfoTip text="Wenn die KI eine Aufgabe lösen soll, die oben nicht speziell definiert ist, kannst du diese hier beschreiben. Sage dem KI-Modell genau, was du erreichen möchtest. Wenn du die Antwort in einem bestimmten Format, z.B. Stichpunkte, haben möchtest, teile diese Information ebenfalls der KI mit. Desto mehr Informationen das Modell hat, desto passender wird die Antwort.">
                      <input
                        className={chatStyles.field}
                        type="text"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Deine Frage an die KI"
                      />
                    </InfoTip>
                    <InfoTip text="Dem KI-Modell kann mitgeteilt werden, in welchem Schreibstil es einen Text verfassen soll. Dies wird dem Prompt hinzugefügt.">
                      {/* <select
                        className={chatStyles.field}
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value)}
                      >
                        {writingStyles.map((opt) => (
                          <option value={opt.value} key={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select> */}
                      <input
                        className={chatStyles.field}
                        list="writing-style-options"
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value)}
                        placeholder="Schreibstil (optional)"
                      />
                      <datalist id="writing-style-options">
                        {writingStyles
                          .filter((opt) => !!opt.value)
                          .map((opt) => (
                            <option value={opt.value} key={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </datalist>
                    </InfoTip>
                    {isShowingSynonym && (
                      <InfoTip text="Gib hier das Wort ein, für das das Synonym vorgeschlagen werden soll. Die KI nutzt dann deinen Textabschnitt, und versucht dieses Wort darin zu ersetzen.">
                        <input
                          className={
                            chatStyles.field + " " + chatStyles.syninput
                          }
                          type="text"
                          value={synonym}
                          onChange={(e) => setSynonym(e.target.value)}
                          placeholder="Wort/Synonym"
                        />
                      </InfoTip>
                    )}
                    <InfoTip text="Zusätzlich zur Aufgabe können der KI noch weitere Informationen mitgegeben werden. Alles was hier eingegeben wird, wird zusätzlich zur Aufgabenbeschreibung dem KI-Modell übergeben. Wenn du spezifische Anforderungen an das Modell hast, beschreibe diese hier. ">
                      <input
                        className={chatStyles.field}
                        type="text"
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="Zusatztipp (optional)"
                      />
                    </InfoTip>
                    <InfoTip text="Es gibt unterschiedliche KI-Modelle. Alle sind auf unterschiedliche Aufgabentypen oder sprachen spezialisiert. Außerdem sind sie unterschiedlich groß. Größere Modelle können komplexere Aufgaben lösen, benötigen dafür jedoch auch mehr Rechenleistung von dem Gerät, auf dem sie installiert sind. Für die vordefinierten Aufgaben werden empfohlene Modelle vorgeschlagen. Du kannst jedoch unter 'KI-Modelle' oben in der Kopfzeile auch andere Modelle installieren. ">
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
                    </InfoTip>
                  </div>
                </div>
              )}
              <div className={chatStyles.saveChatRow}>
                {isEditingChatTitle ? (
                  <>
                    <Tooltip text="Chat-Titel bearbeiten">
                      <input
                        className={chatStyles.field}
                        type="text"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                        placeholder="Chat-Titel"
                        autoFocus
                      />
                    </Tooltip>
                    <Tooltip text="Chat speichern">
                      <button
                        className={chatStyles.btn}
                        onClick={() => {
                          saveChatWithAnswers();
                          setIsEditingChatTitle(false);
                        }}
                      >
                        Bestätigen
                      </button>
                    </Tooltip>
                    <button
                      className={chatStyles.btn}
                      onClick={() => setIsEditingChatTitle(false)}
                      style={{ marginLeft: "8px" }}
                      type="button"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <Tooltip text="Chat speichern">
                    <button
                      className={chatStyles.btn}
                      onClick={() => setIsEditingChatTitle(true)}
                    >
                      Chat speichern
                    </button>
                  </Tooltip>
                )}
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
                    <div className={chatStyles.commentHeader}>
                      <h4 style={{ margin: 0 }}>Kommentar bearbeiten</h4>
                      <Tooltip text="Antwort kopieren">
                        <button
                          className={chatStyles.copyBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(noteDraft || "");
                          }}
                        >
                          📋
                        </button>
                      </Tooltip>
                    </div>
                    <TextareaAutosize
                      rows={13}
                      maxRows={13}
                      className={chatStyles.textarea}
                      style={{ width: "100%" }}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      disabled={isSavingNote || currentMode === 3}
                    />
                    <div style={{ margin: "10px 0" }}>
                      <label className={chatStyles.label}>
                        Kommentar aktivieren:
                      </label>
                      <InfoTip text="Ist ein Kommentar aktiviert, wird er dem KI-Modell bei der nächsten Anfrage als Kontext mitgegeben. Das Bedeutet, die KI kann alle Informationen und Hinweise aus dem Kommentar bei der nächsten Antwort beachten.">
                        <Switch
                          checked={userNoteEnabledDraft}
                          onChange={setUserNoteEnabledDraft}
                        />
                      </InfoTip>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Tooltip text="Kommentar speichern">
                        <button
                          className={
                            chatStyles.saveCommentBtn + " " + chatStyles.btn
                          }
                          onClick={handleSaveNote}
                          disabled={isSavingNote}
                        >
                          Speichern
                        </button>
                      </Tooltip>
                      <Tooltip text="Abbrechen">
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
                      </Tooltip>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default ChatComponent;
