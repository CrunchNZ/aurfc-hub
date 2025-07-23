import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Chat from './components/Chat';

// TODO: Import other components as we build them

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default to login */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          {/* Add more routes here, e.g., <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
