// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import DatePickerComponent from './DatePickerComponent';
import NoteDisplayComponent from './NoteDisplayComponent';
import { storeInLocalStorage, getFromLocalStorage, storeInFirebase, getFromFirebase } from './storage';
import { registerUser, loginUser, logoutUser } from './auth';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({ vocabulary: [], text: "", link: [] });
  const [noteType, setNoteType] = useState("vocabulary");
  const [storageType, setStorageType] = useState("firebase"); // Control where data is saved
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      setIsAuthenticated(true);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      alert("Registration successful!");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
  };

  const handleStorageTypeChange = (e) => {
    setStorageType(e.target.value);
  };

  useEffect(() => {
    if (selectedDate) {
      loadNotesForDate(selectedDate);
    }
  }, [selectedDate, storageType]);

  const loadNotesForDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    let loadedNotes = { vocabulary: [], text: "", link: [] };

    if (storageType === "local") {
      const localNotes = getFromLocalStorage(`notes-${formattedDate}`);
      loadedNotes = localNotes || loadedNotes;
    } else if (storageType === "firebase") {
      const firebaseNotes = await getFromFirebase(`notes-${formattedDate}`);
      loadedNotes = firebaseNotes.length > 0 ? firebaseNotes[0] : loadedNotes;
    }
    setNotes(loadedNotes);
  };

  const saveNotesForDate = async () => {

    const formattedDate = selectedDate.toISOString().split('T')[0];
    const noteData = { date: formattedDate, createdDatetime: new Date().toISOString(), ...notes };
    console.log(noteData);
    if (storageType === "local") {
      storeInLocalStorage(`notes-${formattedDate}`, notes);
      alert("Notes saved to local storage successfully!");
    } else if (storageType === "firebase") {
      if (!isAuthenticated) {
        alert("You must be logged in to save notes to Firebase.");
        return;
      }
      alert("store in firebase" + `notes-${formattedDate}`);
      await storeInFirebase(`notes-${formattedDate}`, noteData);
      alert("Notes saved to Firebase successfully!");
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleExportNotes = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `notes-${formattedDate}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } else {
      alert("Please select a date to export notes.");
    }
  };

  const test_firebase = () => {
    const newNote = {
      title: "My Note",
      content: "This is the content of my note.",
      date: new Date(),
    };

    storeInFirebase('notes', newNote);
  }

  return (
    <div>
      <h1>Vocabulary and Notes App</h1>
      {isAuthenticated ? (
        <div className='container'>
          <p>Welcome! You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>
          {/* Rest of your app goes here */}
        </div>
      ) : (
        <div className='container'>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}
      <div className="container">
        <DatePickerComponent onDateChange={handleDateChange} className="date-picker" />

        <label>Storage Type:</label>
        <select onChange={handleStorageTypeChange} value={storageType}>
          <option value="local">Local Storage</option>
          <option value="firebase">Firebase</option>
        </select>
        <button onClick={saveNotesForDate}>Save</button>
        <button onClick={handleExportNotes}>Export to JSON</button>
      </div>

      <NoteDisplayComponent
        notes={notes}
        onNotesChange={setNotes}
        noteType={noteType}
      />
    </div>
  );
}

export default App;
