import React, { useState, useEffect } from 'react';
import { sendMessage, getMessages } from '../services/chat';
import { auth } from '../firebase';

function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsubscribe = getMessages(roomId, setMessages);
    return unsubscribe;
  }, [roomId]);

  const handleSend = async () => {
    if (text.trim()) {
      await sendMessage(roomId, { text, userId: auth.currentUser.uid });
      setText('');
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div>
        {messages.map(msg => (
          <p key={msg.id}>{msg.text}</p>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default Chat; 