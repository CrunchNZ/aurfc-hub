import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { sendMessage, getMessages, createChatRoom, getChatRooms } from '../services/chat';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Paperclip, 
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';

function Chat() {
  const { roomId } = useParams();
  const [user, setUser] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoomList, setShowRoomList] = useState(!roomId);
  const [newRoomName, setNewRoomName] = useState('');
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadChatRooms(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentRoomId) {
      loadCurrentRoom(currentRoomId);
      const unsubscribe = setupMessagesListener(currentRoomId);
      return unsubscribe;
    }
  }, [currentRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async (userId) => {
    try {
      const rooms = await getChatRooms(userId);
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadCurrentRoom = async (roomId) => {
    try {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (roomDoc.exists()) {
        setCurrentRoom({ id: roomDoc.id, ...roomDoc.data() });
      }
    } catch (error) {
      console.error('Error loading current room:', error);
    }
  };

  const setupMessagesListener = (roomId) => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
    });
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    if (!user || !currentRoomId) return;

    try {
      const messageData = {
        text: text.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: new Date(),
        roomId: currentRoomId
      };

      if (file) {
        // Handle file upload here
        messageData.file = {
          name: file.name,
          size: file.size,
          type: file.type
        };
        // In a real app, you'd upload the file to storage and include the URL
      }

      await sendMessage(currentRoomId, messageData);
      setText('');
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !user) return;

    try {
      const roomData = {
        name: newRoomName,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: new Date(),
        type: 'group'
      };

      const roomId = await createChatRoom(roomData);
      setNewRoomName('');
      setShowNewRoomModal(false);
      await loadChatRooms(user.uid);
      setCurrentRoomId(roomId);
      setShowRoomList(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room. Please try again.');
    }
  };

  const handleRoomSelect = (roomId) => {
    setCurrentRoomId(roomId);
    setShowRoomList(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar - Room List */}
      {showRoomList && (
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <button
              onClick={() => setShowNewRoomModal(true)}
              className="btn-icon btn-primary"
              title="Create New Room"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="sidebar-search">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rooms-list">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className={`room-item ${currentRoomId === room.id ? 'active' : ''}`}
                onClick={() => handleRoomSelect(room.id)}
              >
                <div className="room-avatar">
                  <MessageSquare size={24} />
                </div>
                <div className="room-info">
                  <h4>{room.name}</h4>
                  <p>{room.lastMessage?.text || 'No messages yet'}</p>
                </div>
                <div className="room-meta">
                  <small>{room.lastMessage?.timestamp ? 
                    formatTimestamp(room.lastMessage.timestamp) : ''}</small>
                  {room.unreadCount > 0 && (
                    <span className="unread-badge">{room.unreadCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="chat-main">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                {showRoomList && (
                  <button
                    onClick={() => setShowRoomList(false)}
                    className="btn-icon"
                  >
                    ←
                  </button>
                )}
                <div className="chat-info">
                  <h3>{currentRoom.name}</h3>
                  <p>{currentRoom.members?.length || 0} members</p>
                </div>
              </div>
              <div className="chat-header-right">
                <button className="btn-icon" title="Voice Call">
                  <Phone size={16} />
                </button>
                <button className="btn-icon" title="Video Call">
                  <Video size={16} />
                </button>
                <button className="btn-icon" title="Room Info">
                  <Info size={16} />
                </button>
                <button className="btn-icon" title="More Options">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              <div className="messages-list">
                {messages.map((message, index) => {
                  const isOwnMessage = message.userId === user?.uid;
                  const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                    >
                      {!isOwnMessage && showAvatar && (
                        <div className="message-avatar">
                          <div className="avatar-placeholder">
                            {message.userName?.charAt(0) || 'U'}
                          </div>
                        </div>
                      )}
                      <div className="message-content">
                        {!isOwnMessage && showAvatar && (
                          <div className="message-sender">{message.userName}</div>
                        )}
                        <div className="message-bubble">
                          {message.text}
                          {message.file && (
                            <div className="message-file">
                              <Paperclip size={14} />
                              <span>{message.file.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="message-time">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              {file && (
                <div className="file-preview">
                  <div className="file-info">
                    <Paperclip size={16} />
                    <span>{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="file-remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <div className="message-input">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-icon"
                  title="Attach File"
                >
                  <Paperclip size={16} />
                </button>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="message-textarea"
                  rows={1}
                />
                <button
                  onClick={() => {/* Emoji picker */}}
                  className="btn-icon"
                  title="Add Emoji"
                >
                  <Smile size={16} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!text.trim() && !file}
                  className="btn btn-primary send-button"
                  title="Send Message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <MessageSquare size={64} />
            <h3>Select a chat room</h3>
            <p>Choose a room from the sidebar to start messaging</p>
            {!showRoomList && (
              <button
                onClick={() => setShowRoomList(true)}
                className="btn btn-primary"
              >
                Show Rooms
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showNewRoomModal && (
        <div className="modal-overlay" onClick={() => setShowNewRoomModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Room</h2>
              <button onClick={() => setShowNewRoomModal(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowNewRoomModal(false)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleCreateRoom} className="btn btn-primary">
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat; 