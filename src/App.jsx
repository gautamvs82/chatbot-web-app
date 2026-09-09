import { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const inputRef = useRef(null);

  function toISOStringWithTZ(date = new Date(), timeZone = 'America/New_York') {
    // Format individual parts using the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'longOffset', // Returns e.g. "GMT-04:00"
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((p) => [p.type, p.value])
    );

    // Extract offset and format it (convert "GMT-04:00" -> "-04:00")
    let offset = parts.timeZoneName.replace('GMT', '');
    if (offset === '') offset = 'Z'; // UTC case

    // Adjust hour 24 edge case from Intl
    const hour = parts.hour === '24' ? '00' : parts.hour;

    return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:${parts.second}${offset}`;
  }

  const updateConversation = async (text) => {
    const requestPayload = {
      "username": username,
      "conversation_id": conversationId,
      "message_id": `usr-msg-${Date.now()}-0`,
      "message": text,
      "sent_at": toISOStringWithTZ(new Date(), 'Asia/Kolkata'),
    }
    const userMessage = {
      id: requestPayload.message_id,
      sender: "User",
      text: requestPayload.message,
      sent_at: requestPayload.sent_at,
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setStatus('loading');
    await fetchEventSource('http://127.0.0.1:5090/api/update-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),

      onmessage(msg) {
        // msg.event contains the SSE event name (e.g. "message-update")
        // msg.data contains the stringified JSON payload
        console.log('Raw SSE data:', msg.data);
        const parsedData = JSON.parse(msg.data);
        switch (parsedData.event) {
          case 'message-update':
            const parsedMessage = {
              id: parsedData.data.message_id,
              sender: "System",
              text: parsedData.data.message,
              sent_at: parsedData.data.sent_at,
            };
            setChatMessages((prev) => [...prev, parsedMessage]);
            break;

          case 'message-complete':
            setStatus(`Finished: ${parsedData.data.status}`);
            break;

          default:
            console.log('Unhandled event type:', msg.event, parsedData);
        }
      },

      onerror(err) {
        console.error('SSE Stream Error:', err);
        setStatus('error');
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputValue = inputRef.current.value;
    
    if (!inputValue.trim()) return;

    updateConversation(inputValue);
    inputRef.current.value = ''; // Clear input
  };

  useEffect(() => {
    const createConversation = async () => {
      try {
        const userConversationData = { username: 'tom.cat', conversationId: 'CONV#20260906184602' };
        setUsername(userConversationData.username);
        setConversationId(userConversationData.conversationId);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    createConversation();
  }, []);

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
