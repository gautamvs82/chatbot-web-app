import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputValue = inputRef.current.value;
    
    if (!inputValue.trim()) return;

    //updateConversation(inputValue);
    inputRef.current.value = ''; // Clear input
  };

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const data = [
          { id: 1, sender: 'System', text: 'Hello, how can I help you today?', sent_at: '2023-10-01T12:00:00Z' },
          { id: 2, sender: 'User', text: 'I am looking for information about your services.', sent_at: '2023-10-01T12:01:00Z' },
        ];
        setChatMessages(data);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchChatMessages();
  }, []);

  return (
    <>
      <div className="app-shell">
        <main className="chat-panel">
          <div className="panel-card chat-card">
            <div className="panel-header">
              <div>
                <p className="panel-label">Customer Support Chat</p>
                <h2>I'll help you with any questions you have!</h2>
              </div>
            </div>
            <div className="chat-window">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`message ${message.sender === 'User' ? 'user' : 'system'}`}>
                      <div className={`message-bubble ${message.sender === 'User' ? 'user-bubble' : ''}`}>
                        <p className="message-text">{message.text}</p>
                      </div>
                      <span className="message-time">
                        {message.sent_at.replace('T', ' ').replace('Z', '')}
                      </span>
                    </div>
                  ))}
            </div>
            <form className="chat-form" onSubmit={handleSubmit}>
              <input ref={inputRef} type="text" placeholder="Your message..." aria-label="Your message" />
              <button type="submit">Send</button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
