import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {


  interface ChatRequest {
    user_prompt: string;
    system_info: string;
  }

  interface ChatResponse {
    response: string;
  }

  // Der Fetch-Aufruf mit Typen:
  async function sendChatRequest(): Promise<void> {
    const requestBody: ChatRequest = {
      user_prompt: "Why is the sky blue?",
      system_info: "physics and atmospheric sciences"
    };

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Stelle sicher, dass die Antwort dem definierten Typ entspricht
      const data: ChatResponse = await response.json();
      console.log(data.response);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Rufe die Funktion auf
  sendChatRequest();


  return (
    <>
      <p>Hallo</p>
    </>
  )
}

export default App
