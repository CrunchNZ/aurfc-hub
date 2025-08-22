// Script to upload AURFC logo to Firebase Storage
// Run with: node scripts/upload-logo.js

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config - update with your production config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_PROD_API_KEY,
  authDomain: process.env.VITE_FIREBASE_PROD_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROD_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_PROD_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_PROD_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadLogo() {
  try {
    console.log('🚀 Starting logo upload to Firebase Storage...');
    
    // Path to your logo file (update this path to your actual logo file)
    const logoPath = join(__dirname, '../assets/aurfc-logo.png'); // or .jpg, .svg
    
    // Check if file exists
    try {
      const logoBuffer = readFileSync(logoPath);
      console.log('✅ Logo file found:', logoPath);
      
      // Upload to Firebase Storage
      const logoRef = ref(storage, 'images/aurfc-logo.png');
      const snapshot = await uploadBytes(logoRef, logoBuffer);
      console.log('✅ Logo uploaded successfully!');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      // Update your components to use this URL instead of local files
      console.log('\n📝 Next steps:');
      console.log('1. Update Logo.jsx component to use the Firebase Storage URL');
      console.log('2. Or keep using local SVG for better performance');
      console.log('3. The logo is now available at:', downloadURL);
      
    } catch (fileError) {
      console.log('⚠️  Logo file not found at:', logoPath);
      console.log('💡 To use this script:');
      console.log('   1. Place your logo file in the assets/ folder');
      console.log('   2. Update the logoPath variable above');
      console.log('   3. Run: node scripts/upload-logo.js');
    }
    
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
  }
}

// Run the upload
uploadLogo();
