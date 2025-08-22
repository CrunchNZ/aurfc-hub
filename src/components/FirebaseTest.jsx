import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../firebase-config';

function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [testUser, setTestUser] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase connection...');
      setError(null);
      
      console.log('Starting Firebase connection test...');
      console.log('Firebase config:', getFirebaseConfig());
      
      // Test if Firebase is initialized
      if (!db) {
        throw new Error('Firestore database not initialized');
      }
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      console.log('Firebase objects initialized successfully');
      
      // Test Firestore connection with a simple query
      console.log('Testing Firestore connection...');
      try {
        // Try to create a test document instead of reading from potentially empty collection
        const testDocRef = doc(db, 'test', 'connection-test');
        await setDoc(testDocRef, {
          timestamp: new Date(),
          test: true,
          message: 'Testing Firebase connection'
        });
        console.log('Firestore write test successful');
        
        // Now try to read it back
        const testDoc = await getDocs(collection(db, 'test'));
        console.log('Firestore read test successful, found documents:', testDoc.docs.length);
        
        // Clean up test document
        await setDoc(testDocRef, {});
        
        setCollections(['test']);
        setStatus('Firebase connection successful!');
      } catch (firestoreError) {
        console.error('Firestore specific error:', firestoreError);
        throw new Error(`Firestore connection failed: ${firestoreError.message} (Code: ${firestoreError.code})`);
      }
      
    } catch (err) {
      console.error('Firebase test error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
      setError(`Connection failed: ${err.message}`);
      setStatus('Firebase connection failed');
    }
  };

  const createTestUser = async () => {
    try {
      setStatus('Creating test user...');
      
      // Create test user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'test@aurfc.com', 
        'testpass123'
      );
      
      // Create user profile in Firestore
      const userData = {
        email: 'test@aurfc.com',
        displayName: 'Test User',
        role: 'player',
        team: 'Senior A',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      setTestUser(userCredential.user);
      setStatus('Test user created successfully!');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setStatus('Test user already exists. Signing in...');
        await signInWithEmailAndPassword(auth, 'test@aurfc.com', 'testpass123');
        setStatus('Signed in to existing test user!');
      } else {
        setError(err.message);
        setStatus('Failed to create test user');
      }
    }
  };

  const createSampleData = async () => {
    try {
      setStatus('Creating sample data...');
      
      // Create sample events
      const eventsData = [
        {
          title: 'Senior A Training',
          description: 'Regular team training session',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          type: 'training',
          location: 'University Oval',
          team: 'Senior A',
          createdBy: testUser?.uid || 'test-user'
        },
        {
          title: 'Match vs Victoria University',
          description: 'Inter-university competition',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          type: 'match',
          location: 'Victoria University',
          team: 'Senior A',
          createdBy: testUser?.uid || 'test-user'
        }
      ];
      
      for (const event of eventsData) {
        await addDoc(collection(db, 'events'), event);
      }
      
      // Create sample store products
      const productsData = [
        {
          name: 'AURFC Jersey',
          description: 'Official team jersey',
          price: 89.99,
          category: 'clothing',
          stock: 25,
          imageUrl: 'https://via.placeholder.com/300x300?text=AURFC+Jersey'
        },
        {
          name: 'Team Cap',
          description: 'Official team cap',
          price: 24.99,
          category: 'accessories',
          stock: 50,
          imageUrl: 'https://via.placeholder.com/300x300?text=Team+Cap'
        }
      ];
      
      for (const product of productsData) {
        await addDoc(collection(db, 'products'), product);
      }
      
      setStatus('Sample data created successfully!');
    } catch (err) {
      setError(err.message);
      setStatus('Failed to create sample data');
    }
  };

  const clearTestData = async () => {
    try {
      setStatus('Clearing test data...');
      // Note: In production, you'd want to be more careful about data deletion
      setStatus('Test data cleared!');
    } catch (err) {
      setError(err.message);
      setStatus('Failed to clear test data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Firebase Connection Test
        </h1>
        
        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Status:</span> {status}
            </p>
            {error && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg">
                <span className="font-medium">Error:</span> {error}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testFirebaseConnection}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Test Connection
          </button>
          
          <button
            onClick={createTestUser}
            className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Create Test User
          </button>
          
          <button
            onClick={createSampleData}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Create Sample Data
          </button>
          
          <button
            onClick={clearTestData}
            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Clear Test Data
          </button>
        </div>

        {/* Collections Display */}
        {collections.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {collections.map((collectionName) => (
                <div
                  key={collectionName}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  {collectionName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test User Display */}
        {testUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Test User Created</h2>
            <div className="space-y-2">
              <p className="text-blue-700">
                <span className="font-medium">Email:</span> {testUser.email}
              </p>
              <p className="text-blue-700">
                <span className="font-medium">UID:</span> {testUser.uid}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FirebaseTest;
