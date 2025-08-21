import React, { useState, useEffect, useRef, useContext } from 'react';
import { sendMessage, getMessages, getUserChatRooms, createChatRoom } from '../services/chat';
import { AuthContext } from '../contexts/AuthContext';
import { getCurrentUserRole } from '../services/auth';

function Chat({ initialRoomId = 'general' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [userRole, setUserRole] = useState('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const unsubscribeMessages = useRef(null);
  const unsubscribeRooms = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get user role and available rooms
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const role = await getCurrentUserRole();
          setUserRole(role || 'player');
          
          // Get available chat rooms for this user
          unsubscribeRooms.current = getUserChatRooms(role || 'player', (rooms) => {
            setAvailableRooms(rooms);
          });
        } catch (error) {
          console.error('Error fetching user role:', error);
          setError('Failed to load user information');
        }
      }
    };

    fetchUserRole();

    return () => {
      if (unsubscribeRooms.current) {
        unsubscribeRooms.current();
      }
    };
  }, [user]);

  // Subscribe to messages for current room
  useEffect(() => {
    if (currentRoomId && user) {
      setLoading(true);
      setError('');
      
      // Clean up previous subscription
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
      }

      // Subscribe to messages
      unsubscribeMessages.current = getMessages(currentRoomId, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      });
    }

    return () => {
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
      }
    };
  }, [currentRoomId, user]);

  // Handle sending messages
  const handleSend = async () => {
    if (text.trim() && user) {
      try {
        setError('');
        await sendMessage(
          currentRoomId, 
          { text: text.trim(), userRole }, 
          user
        );
        setText('');
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Switch chat room
  const switchRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setMessages([]);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          Please log in to access the chat.
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AURFC Chat</h2>
        <div className="room-selector">
          <select 
            value={currentRoomId} 
            onChange={(e) => switchRoom(e.target.value)}
            className="room-select"
          >
            {availableRooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.userId === user.uid ? 'own-message' : ''}`}>
                  <div className="message-header">
                    <span className="message-author">{msg.userName}</span>
                    <span className="message-role">({msg.userRole})</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-input-container">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="message-input"
          rows="2"
        />
        <button 
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className="send-button"
        >
          Send
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .chat-header h2 {
          margin: 0;
          color: #333;
        }

        .room-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: #fafafa;
        }

        .message {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message.own-message {
          background: #e3f2fd;
          margin-left: 2rem;
        }

        .message-header {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .message-author {
          font-weight: 600;
          color: #333;
        }

        .message-role {
          color: #888;
        }

        .message-time {
          margin-left: auto;
        }

        .message-text {
          color: #333;
          line-height: 1.4;
        }

        .message-input-container {
          display: flex;
          padding: 1rem;
          border-top: 1px solid #eee;
          background: white;
          gap: 0.5rem;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
        }

        .send-button {
          padding: 0.75rem 1.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .send-button:hover {
          background: #1976d2;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading, .no-messages {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .chat-error {
          background: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          margin: 0.5rem;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Chat;