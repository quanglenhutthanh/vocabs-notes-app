import './App.css'
import React, { useState, useEffect } from 'react';
import DatePickerComponent from './DatePickerComponent';
import NoteDisplayComponent from './NoteDisplayComponent';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({ vocabulary: [], text: "", link: [] });
  const [noteType, setNoteType] = useState("vocabulary"); // Add noteType state

  const handleNoteTypeChange = (e) => {
    setNoteType(e.target.value);
  };

  // Load notes from localStorage when date changes or on refresh
  useEffect(() => {
    if (selectedDate) {
      loadNotesForDate(selectedDate);
    }
  }, [selectedDate]);

  // Function to load notes from localStorage based on the selected date
  const loadNotesForDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const storedNotes = localStorage.getItem(`notes-${formattedDate}`);
    setNotes(storedNotes ? JSON.parse(storedNotes) : { vocabulary: [], text: "", link: [] });
  };

  // Save notes to localStorage for the selected date
  const saveNotesForDate = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Log to verify selectedDate and notes content
      console.log("Saving notes for date:", formattedDate);
      console.log("Notes content:", notes);

      // Save to localStorage
      localStorage.setItem(`notes-${formattedDate}`, JSON.stringify(notes));
      alert("Notes saved successfully!");
    } else {
      alert("Please select a date before saving notes.");
    }
  };


  // Handle date change and load corresponding notes
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle exporting notes to JSON
  const handleExportNotes = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `notes-${formattedDate}.json`;
      link.click();

      URL.revokeObjectURL(url); // Clean up URL after download
    } else {
      alert("Please select a date to export notes.");
    }
  };

  return (
    <div>
      <h1>Vocabulary and Notes App</h1>
      
        <div className="date-picker-container">
          <DatePickerComponent onDateChange={handleDateChange} className="date-picker" />
          <button onClick={saveNotesForDate}>Save</button>
          <button onClick={handleExportNotes}>Export to JSON</button>
        </div>
      


      {/* <select onChange={handleNoteTypeChange}>
        <option value="note">Note</option>
        <option value="vocabulary">Vocabulary</option>
      </select> */}
      <NoteDisplayComponent
        notes={notes}
        onNotesChange={setNotes}
        noteType={noteType} // Pass noteType as a prop
      />
      
    </div>
  );
}

export default App;
