import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import ProjectView from "./components/ProjectView";

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1>Komischer Schreibassistent</h1>
        </Link>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectView />} />{" "}
          {/* Adjust path */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// import React, { useState } from "react";
// import axios from "axios";

// interface ChatRequest {
//   user_prompt: string;
//   system_info: string;
// }

// interface ChatResponse {
//   response: string;
// }

// const App: React.FC = () => {
//   const [userPrompt, setUserPrompt] = useState("");
//   const [systemInfo, setSystemInfo] = useState("");
//   const [response, setResponse] = useState("");

//   const handleSend = async () => {
//     if (userPrompt.trim() === "") {
//       alert("Please enter a question.");
//       return;
//     }

//     if (systemInfo.trim() === "") {
//       alert("Please enter some context");
//       return;
//     }

//     const requestBody: ChatRequest = {
//       user_prompt: userPrompt,
//       system_info: systemInfo,
//     };

//     console.log(userPrompt);
//     console.log(systemInfo);

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
//     if (response.trim() === "") {
//       alert("No response to save.");
//       return;
//     }

//     //Daten
//     const title = "Cooler Titel";
//     const aiModel = "llama3.2";
//     const paragraphId = 1;
//     //Object mit allen Daten, die gespeichert werden sollen
//     const chatData = {
//       title: title,
//       aiModel: aiModel,
//       content_json: JSON.stringify({
//         user_prompt: userPrompt,
//         response: response,
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

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>komischer Schreibassistent</h1>
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
//       <button onClick={handleSend}>Send</button>
//       <div style={{ marginTop: "20px" }}>
//         {response && `AI Response: ${response}`}
//       </div>
//       <button onClick={handleSaveChat}>Save answer</button>
//     </div>
//   );
// };

// export default App;
