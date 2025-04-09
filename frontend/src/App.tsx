import React, { useEffect, useState } from 'react';
import axios from 'axios';



interface ChatResponse {
  response: string;
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

const App: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [systemInfo, setSystemInfo] = useState('');
  const [response, setResponse] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [contextInputs, setContextInputs] = useState<ContextInputs>({
    paragraph_content: '',
    writing_style: '',
    task: '',
    user_context: '',
  });


  const handleSend = async () => {
    if (userPrompt.trim() === '' || aiModel === '') {
      alert('Please enter a question and choose a model.');
      return;
    }

    const requestBody: ChatRequest = {
      user_prompt: userPrompt,
      ai_model: aiModel,
      context_inputs: contextInputs,
    };

    console.log(userPrompt)
    console.log(systemInfo)
    console.log(aiModel)



    try {
      const res = await axios.post<ChatResponse>('http://localhost:8000/aiChat', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred while fetching the response.');
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContextInputs({ ...contextInputs, [e.target.name]: e.target.value });
  };

  const handleSaveChat = async () => {
    if (response.trim() === '') {
      alert('No response to save.');
      return;
    }

    //Daten
    const title = 'Cooler Titel';
    const paragraphId = 1;
    //Object mit allen Daten, die gespeichert werden sollen
    const chatData = {
      title: title,
      aiModel: aiModel,
      content_json: JSON.stringify({
        user_prompt: userPrompt,
        response: response
      }),
      paragraph_id: paragraphId,
    };

    try {
      await axios.post('http://localhost:8000/chats', chatData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Chat saved successfully!');
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Error occurred while saving the chat.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Schreibassistent-Prototyp</h1>
      <input
        type="text"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Enter your question"
        style={{ marginRight: '10px' }}
      />

      <input
        type="text"
        value={aiModel}
        onChange={(e) => setAiModel(e.target.value)}
        placeholder="Choose a Model"
        style={{ marginRight: '10px' }}
      />

      <input
        type="text"
        name="paragraph_content"
        value={contextInputs.paragraph_content}
        onChange={handleContextChange}
        placeholder="Enter paragraph content"
        style={{ marginRight: '10px' }}
      />

      <input
        type="text"
        name="writing_style"
        value={contextInputs.writing_style}
        onChange={handleContextChange}
        placeholder="Enter writing style"
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        name="task"
        value={contextInputs.task}
        onChange={handleContextChange}
        placeholder="Enter task"
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        name="user_context"
        value={contextInputs.user_context}
        onChange={handleContextChange}
        placeholder="Enter user context"
        style={{ marginRight: '10px' }}
      />

      <button onClick={handleSend}>Send</button>
      <div style={{ marginTop: '20px' }}>{response && `AI Response: ${response}`}</div>
      <button onClick={handleSaveChat}>Save answer</button>

    </div>
  );
};

export default App;
