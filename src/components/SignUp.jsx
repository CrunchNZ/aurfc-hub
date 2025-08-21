import React, { useState } from 'react';
import { signup } from '../services/auth';
import { verifyEmail } from '../services/auth';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, role, consent);
      const user = auth.currentUser;
      await verifyEmail(user);
      // TODO: Redirect and notify user to check email for verification
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="coach">Coach</option>
          <option value="player">Player</option>
          <option value="parent">Parent</option>
          <option value="junior">Junior</option>
        </select>
        {role === 'junior' && (
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Parental Consent
          </label>
        )}
        <button type="submit">Sign Up</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default SignUp; 