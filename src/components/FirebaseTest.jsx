import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase connection...');
      
      // Test Firestore connection
      const collectionsSnapshot = await getDocs(collection(db, 'users'));
      setCollections(collectionsSnapshot.docs.map(doc => doc.id));
      
      setStatus('Firebase connection successful!');
    } catch (err) {
      setError(err.message);
      setStatus('Firebase connection failed');
      console.error('Firebase test error:', err);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firebase Connection Test</h3>
      <p><strong>Status:</strong> {status}</p>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {collections.length > 0 && (
        <div>
          <p><strong>Collections found:</strong></p>
          <ul>
            {collections.map((id, index) => (
              <li key={index}>{id}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button onClick={testFirebaseConnection}>
        Test Connection Again
      </button>
    </div>
  );
}

export default FirebaseTest;
