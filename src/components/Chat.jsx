import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages, getUserChatRooms, createChatRoom } from '../services/chat';
import { useAuth } from '../contexts/AuthContext';

function Chat({ initialRoomId = 'general' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [userRole, setUserRole] = useState('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser: user } = useAuth();
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-text-secondary mb-4">
            💬 AURFC Team Chat
          </div>
          <div className="text-lg text-text-secondary">
            Please log in to access the team chat and stay connected with your teammates.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-card shadow-lg border border-secondary-light">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 rounded-t-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💬</div>
              <h2 className="text-2xl font-bold text-white">AURFC Team Chat</h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-white text-sm font-medium">Room:</label>
              <select 
                value={currentRoomId} 
                onChange={(e) => switchRoom(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-white/30 bg-white/20 text-white font-medium focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id} className="text-text-primary">
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-accent-red text-white p-4 mx-6 mt-4 rounded-lg text-center font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-secondary-light/20 to-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="loading mx-auto mb-4"></div>
                <div className="text-text-secondary font-medium">Loading messages...</div>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏉</div>
                  <div className="text-xl font-semibold text-text-primary mb-2">
                    Welcome to the team chat!
                  </div>
                  <div className="text-text-secondary">
                    No messages yet. Start the conversation and connect with your teammates.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl shadow-md ${
                        msg.userId === user.uid 
                          ? 'bg-primary text-white rounded-br-md' 
                          : 'bg-white text-text-primary border border-secondary-light rounded-bl-md'
                      }`}>
                        <div className={`flex items-center gap-2 mb-2 ${
                          msg.userId === user.uid ? 'text-white/80' : 'text-text-secondary'
                        }`}>
                          <span className="font-semibold text-sm">{msg.userName}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary-light/50">
                            {msg.userRole}
                          </span>
                          <span className="text-xs ml-auto">{formatTime(msg.timestamp)}</span>
                        </div>
                        <div className="text-sm leading-relaxed">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-secondary-light bg-white rounded-b-card">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                rows="2"
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={!text.trim() || loading}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <div className="flex items-center gap-2">
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </button>
          </div>
          
          {/* Chat Tips */}
          <div className="mt-4 text-center">
            <div className="text-xs text-text-secondary">
              💡 Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Chat Features Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-primary mb-2">Secure Chat</h3>
          <p className="text-sm text-text-secondary">
            All messages are encrypted and stored securely in the cloud.
          </p>
        </div>
        
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-semibold text-primary mb-2">Real-time</h3>
          <p className="text-sm text-text-secondary">
            Instant messaging with real-time updates and notifications.
          </p>
        </div>
        
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-primary mb-2">Team Rooms</h3>
          <p className="text-sm text-text-secondary">
            Organized chat rooms for different teams and purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;