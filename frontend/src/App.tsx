import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ChatRequest {
  user_prompt: string;
  system_info: string;
}

interface ChatResponse {
  response: string;
}

const App: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    if (userPrompt.trim() === '') {
      alert('Please enter a question.');
      return;
    }

    const requestBody: ChatRequest = {
      user_prompt: userPrompt,
      system_info: 'physics and atmospheric sciences',
    };

    console.log(userPrompt)

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


  return (
    <div style={{ padding: '20px' }}>
      <h1>komischer Schreibassitent</h1>
      <input
        type="text"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Enter your question"
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleSend}>Send</button>
      <div style={{ marginTop: '20px' }}>{response && `AI Response: ${response}`}</div>

    </div>
  );
};

export default App;
