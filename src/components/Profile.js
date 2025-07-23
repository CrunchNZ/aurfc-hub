import React, { useState, useEffect } from 'react';
import { auth, updateProfile } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Profile() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setName(userDoc.data().name || '');
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user.uid, { name });
      alert('Profile updated');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <form onSubmit={handleUpdate}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <button type="submit">Update</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Profile; 