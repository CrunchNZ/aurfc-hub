import React, { useState } from 'react';
import { login } from '../services/auth';
import { resetPassword } from '../services/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // TODO: Redirect to dashboard after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    try {
      await resetPassword(resetEmail);
      alert('Password reset email sent');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Email for reset" />
      <button type="button" onClick={handleReset}>Reset Password</button>
    </div>
  );
}

export default Login;
