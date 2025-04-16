import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chat } from "../types/Chat";
import { ChatRequest } from "../types/ChatRequest";
import { ChatResponse } from "../types/ChatResponse";

interface ChatMessage {
  user_prompt: string;
  response: string;
}

interface ChatComponentProps {
  paragraphId: number | null;
  aiModelList: string[];
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  paragraphId,
  aiModelList,
}) => {
  const [systemInfo, setSystemInfo] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [response, setResponse] = useState("");
  const [aiModel, setAiModel] = useState(aiModelList[0] || "");
  const [task, setTask] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [userContext, setUserContext] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
  }, [paragraphId]);

  const handleSend = async () => {
    if (aiModel === "") {
      alert("Please enter a question and choose a model.");
      return;
    }

    const requestBody: ChatRequest = {
      user_prompt: { task, user_prompt: userPrompt },
      ai_model: aiModel,
      context_inputs: {
        paragraph_content: "",
        writing_style: writingStyle,
        user_context: userContext,
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
      setResponse(aiResponse.data.response);

      const newMessage: ChatMessage = {
        user_prompt: userPrompt,
        response: aiResponse.data.response,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Reset question input for next interaction
      setUserPrompt("");
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error occurred while fetching the response.");
    }
  };

  const handleSaveChat = async () => {
    // Check for proper input values and existence of paragraphId
    if (messages.length === 0 || chatTitle.trim() === "" || !paragraphId) {
      alert("Please provide all necessary information.");
      return;
    }

    // Prepare chat data object with current chat contents
    const chatData = {
      title: chatTitle,
      aiModel: aiModel,
      task,
      content_json: JSON.stringify({ messages }),
      paragraph_id: paragraphId,
    };

    try {
      if (activeChat) {
        // If there's an active chat, update its content
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
        // If no active chat, create a new chat entry
        await axios.post("http://localhost:8000/chats", chatData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      alert("Chat saved successfully!");
      setActiveChat(null); // Reset active chat state
      setMessages([]); // Clear messages array
      setChatTitle(""); // Reset chat title input
      fetchChats(); // Refresh chat list to reflect changes
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

  return (
    <div
      style={{
        marginTop: "20px",
        border: "1px solid #ccc",
        padding: "10px",
        width: "300px",
      }}
    >
      <label>{response}</label>
      <h3>AI Chat for Paragraph ID: {paragraphId}</h3>
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
      <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
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
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>User:</strong> {msg.user_prompt}
            <br />
            <strong>AI:</strong> {msg.response}
            <br />
          </div>
        ))}
      </div>
      <input
        type="text"
        value={chatTitle}
        onChange={(e) => setChatTitle(e.target.value)}
        placeholder="Enter title to save the chat"
      />
      <button onClick={handleSaveChat}>Save Chat</button>
      <h4>Saved Chats:</h4>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} onClick={() => handleChatTitleClick(chat)}>
            <h6>{chat.title}</h6>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatComponent;

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// import { Chat } from "../types/Chat";
// import { ChatRequest } from "../types/ChatRequest";
// import { ChatResponse } from "../types/ChatResponse";

// interface ChatComponentProps {
//   paragraphId: number | null;
//   aiModelList: string[];
// }

// const ChatComponent: React.FC<ChatComponentProps> = ({
//   paragraphId,
//   aiModelList,
// }) => {
//   const [systemInfo, setSystemInfo] = useState("");
//   const [chatTitle, setChatTitle] = useState("");
//   const [response, setResponse] = useState("");
//   const [aiModel, setAiModel] = useState("");
//   const [task, setTask] = useState("");
//   const [userPrompt, setUserPrompt] = useState("");
//   const [writingStyle, setWritingStyle] = useState("");
//   const [userContext, setUserContext] = useState("");
//   const [chats, setChats] = useState<Chat[]>([]);

//   const handleSend = async () => {
//     if (aiModel === "") {
//       alert("Please enter a question and choose a model.");
//       return;
//     }

//     const requestBody: ChatRequest = {
//       user_prompt: {
//         task: task,
//         user_prompt: userPrompt,
//       },
//       ai_model: aiModel,
//       context_inputs: {
//         paragraph_content: "",
//         writing_style: writingStyle,
//         user_context: userContext,
//       },
//     };

//     try {
//       const response = await axios.get(
//         `http://localhost:8000/paragraphs/${paragraphId}`
//       );
//       const paragraph = response.data;
//       requestBody.context_inputs.paragraph_content = paragraph.content_json;
//     } catch (error) {
//       console.error("Error fetching the paragraph:", error);
//     }

//     try {
//       const res = await axios.post<ChatResponse>(
//         "http://localhost:8000/aiChat",
//         requestBody,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setResponse(res.data.response);
//     } catch (error) {
//       console.error("Error:", error);
//       setResponse("Error occurred while fetching the response.");
//     }
//   };

//   const handleSaveChat = async () => {
//     if (response.trim() === "" || chatTitle.trim() === "" || !paragraphId) {
//       alert("Please provide all necessary information.");
//       return;
//     }

//     const chatData = {
//       title: chatTitle,
//       aiModel: aiModel,
//       task,
//       content_json: JSON.stringify({
//         user_prompt: userPrompt,
//         response,
//       }),
//       paragraph_id: paragraphId,
//     };

//     try {
//       await axios.post("http://localhost:8000/chats", chatData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       alert("Chat saved successfully!");
//     } catch (error) {
//       console.error("Error saving chat:", error);
//       alert("Error occurred while saving the chat.");
//     }
//   };

//   useEffect(() => {
//     const fetchChats = async () => {
//       if (paragraphId === null) return;

//       try {
//         const response = await axios.get<Chat[]>(
//           `http://localhost:8000/paragraphs/${paragraphId}/chats`
//         );
//         setChats(response.data);
//       } catch (error) {
//         console.error("Error fetching chats:", error);
//       }
//     };
//     fetchChats();
//   }, [paragraphId]);

//   return (
//     <div
//       style={{
//         marginTop: "20px",
//         border: "1px solid #ccc",
//         padding: "10px",
//         width: "300px",
//       }}
//     >
//       <h3>AI Chat for Paragraph ID: {paragraphId}</h3>
//       <input
//         type="text"
//         value={userPrompt}
//         onChange={(e) => setUserPrompt(e.target.value)}
//         placeholder="Enter your question"
//         style={{ marginRight: "10px" }}
//       />
//       <input
//         type="text"
//         value={systemInfo}
//         onChange={(e) => setSystemInfo(e.target.value)}
//         placeholder="Enter context information"
//         style={{ marginRight: "10px" }}
//       />
//       <label>Choose a Model:</label>{" "}
//       <select
//         name="choose AI model"
//         value={aiModel}
//         onChange={(e) => setAiModel(e.target.value)}
//       >
//         {aiModelList.map((model) => (
//           <option key={model} value={model}>
//             {model}
//           </option>
//         ))}
//       </select>
//       <input
//         type="text"
//         value={writingStyle}
//         onChange={(e) => setWritingStyle(e.target.value)}
//         placeholder="Enter writing style"
//         style={{ marginRight: "10px" }}
//       />
//       <input
//         type="text"
//         value={task}
//         onChange={(e) => setTask(e.target.value)}
//         placeholder="Enter task"
//         style={{ marginRight: "10px" }}
//       />
//       <input
//         type="text"
//         value={userContext}
//         onChange={(e) => setUserContext(e.target.value)}
//         placeholder="Enter user context"
//         style={{ marginRight: "10px" }}
//       />
//       <button onClick={handleSend}>Send</button>
//       <div style={{ marginTop: "20px" }}>
//         {response && `AI Response: ${response}`}
//       </div>
//       <input
//         type="text"
//         value={chatTitle}
//         onChange={(e) => setChatTitle(e.target.value)}
//         placeholder="Enter title to save the chat"
//         style={{ marginRight: "10px" }}
//       />
//       <button onClick={handleSaveChat}>Save Answer</button>
//       <h4>Saved Chats:</h4>
//       <ul>
//         {chats.map((chat) => (
//           <li key={chat.id}>
//             <h6>{chat.title}</h6>
//             {/* {JSON.parse(chat.content_json).user_prompt} -{" "}
//             {JSON.parse(chat.content_json).response} */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ChatComponent;
