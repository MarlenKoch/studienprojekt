import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chat } from "../types/Chat";
import { ChatRequest } from "../types/ChatRequest";
import { ChatResponse } from "../types/ChatResponse";
//import { StudentContext } from "../context/StudentContext";
import ReactMarkdown from "react-markdown";

import { useProjectTimer } from "../context/ProjectTimerContext";

interface ChatMessage {
  user_prompt: string;
  response: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isNewChatActive, setIsNewChatActive] = useState(false);
  //const isStudent = useContext(StudentContext);
  const { currentMode } = useProjectTimer();

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

  useEffect(() => {
    fetchChats();
    setMessages([]);
  }, [paragraphId]);

  const findChatMessagesById = (id: number) => {
    fetchChats();
    const chat = chats.find((chat) => chat.id === id);
    if (chat) {
      try {
        const chatContent = JSON.parse(chat.content_json);
        return chatContent.messages || [];
      } catch (error) {
        console.error("Error parsing chat content JSON:", error);
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (activeChat) {
      const activeMessages = findChatMessagesById(activeChat.id);
      setMessages(activeMessages);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const handleSend = async () => {
    if (paragraphId === null) {
      alert("paragraph ID is missing.");
      return;
    }

    const requestBody: ChatRequest = {
      user_prompt: { task, user_prompt: userPrompt },
      ai_model: aiModel,
      context_inputs: {
        paragraph_content: "",
        writing_style: writingStyle,
        user_context: userContext,
        previous_chat_json: JSON.stringify({ messages }),
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
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newMessage: ChatMessage = {
        user_prompt: userPrompt,
        response: aiResponse.data.response,
      };

      // Aktualisiere den State hier und warte bis dies abgeschlossen ist
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      if (currentMode === 1 || currentMode === 2) {
        const chatData = {
          title: "Schüler-Chat",
          aiModel: aiModel,
          task,
          content_json: JSON.stringify({ messages: updatedMessages }), // benutze aktualisierte Nachrichten
          paragraph_id: paragraphId,
        };

        try {
          if (activeChat) {
            await axios.put(
              `http://localhost:8000/chats/${activeChat.id}`,
              chatData,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            alert("Chat updtd successfully!");
          } else {
            await axios.post("http://localhost:8000/chats", chatData, {
              headers: {
                "Content-Type": "application/json",
              },
            });
            alert("Chat saved successfully!");
          }
          setIsNewChatActive(false);
          fetchChats();
        } catch (error) {
          console.error("Error saving chat:", error);
          alert("Error occurred while saving the chat.");
        }
      }

      setUserPrompt("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSaveChat = async () => {
    if (messages.length === 0 || chatTitle.trim() === "" || !paragraphId) {
      alert("Please provide all necessary information.");
      console.log(messages, chatTitle, paragraphId);
      return;
    }

    const chatData = {
      title: chatTitle,
      aiModel: aiModel,
      task,
      content_json: JSON.stringify({ messages }),
      paragraph_id: paragraphId,
    };

    try {
      if (activeChat) {
        await axios.put(
          `http://localhost:8000/chats/${activeChat.id}`,
          chatData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        await axios.post("http://localhost:8000/chats", chatData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      alert("Chat saved successfully!");
      setIsNewChatActive(false);
      fetchChats();
    } catch (error) {
      console.error("Error saving chat:", error);
      alert("Error occurred while saving the chat.");
    }
  };

  const handleChatTitleClick = (chat: Chat) => {
    setActiveChat(chat);

    try {
      const chatContent = JSON.parse(chat.content_json);
      setMessages(chatContent.messages || []);
    } catch (error) {
      console.error("Error parsing chat content JSON:", error);
      setMessages([]);
    }

    setChatTitle(chat.title);
    setAiModel(chat.aiModel);
    setTask(chat.task);
    setUserPrompt("");
  };

  const handleNewChat = () => {
    setIsNewChatActive(true);
    setActiveChat(null);
    setMessages([]);
    setChatTitle("blub test");
    //setResponse("");
  };

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
      {/* Button nur in den Modi 0,1,2 */}
      {(currentMode === 0 || currentMode === 1 || currentMode === 2) && (
        <button onClick={handleNewChat}>New Chat</button>
      )}

      {(activeChat || isNewChatActive) && (
        <>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>User:</strong> {msg.user_prompt}
                <br />
                <strong>AI:</strong>
                <ReactMarkdown>{msg.response}</ReactMarkdown>
                <br />
              </div>
            ))}
          </div>
          {/* Wenn Modus 3: alles readonly/disabled, keine Felder */}
          {currentMode !== 3 && (
            <>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your question"
              />
              <input
                type="text"
                value={systemInfo}
                onChange={(e) => setSystemInfo(e.target.value)}
                placeholder="Enter system information"
              />
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
                placeholder="Enter writing style"
              />
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task"
              />
              <input
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Enter user context"
              />
              <button onClick={handleSend}>Send</button>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Enter title to save the chat"
              />
              <button onClick={handleSaveChat}>Save Chat</button>
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
