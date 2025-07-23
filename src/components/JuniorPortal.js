import React, { useState } from 'react';
import { uploadContent, awardBadge } from '../services/junior';
import { auth } from '../firebase';

function JuniorPortal() {
  const [file, setFile] = useState(null);
  const user = auth.currentUser;

  const handleUpload = async () => {
    if (file) {
      await uploadContent(user.uid, file.name, file);
    }
  };

  return (
    <div>
      <h2>Junior Portal</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default JuniorPortal; 