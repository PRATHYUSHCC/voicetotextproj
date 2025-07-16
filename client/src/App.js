import React, { useState, useEffect } from 'react';
import NotesList from './noteslist';

function App() {
  const [notes, setNotes] = useState([]);
  const [audio, setAudio] = useState(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
   const [darkMode, setDarkMode] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch('http://localhost:5000/notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);


  const upload = async () => {
    const formData = new FormData();
    formData.append('audio', audio);

    try {
      const res = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setText(data.text);

      await fetch('http://localhost:5000/savenote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Untitled', text: data.text }),
      });

      console.log('Note saved to DB.');
      fetchNotes(); // refresh notes after save
    } catch (err) {
      console.error('Error uploading or saving:', err);
    }
  };

  return (
     <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300 font-sans px-6 py-12">
      <button
        className="fixed top-4 right-4 px-3 py-1 bg-primary text-white rounded transition"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold mb-6 text-primary dark:text-indigo-300 text-center">
          Voice to Text Notes
        </h1>

        <input
          type="text"
          className="w-full mb-4 px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-md transition-all"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          accept="audio/*"
          className="w-full mb-4"
          onChange={(e) => setAudio(e.target.files[0])}
        />

        <button
          onClick={upload}
          className="bg-primary  decoration-sky-500 font-bold px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300"
        >
          Transcribe
        </button>

        {text && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Transcribed Text:</h2>
            <p className="whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-4 rounded-md border dark:border-gray-600">
              {text}
            </p>
          </div>
        )}
      </div>

      <NotesList notes={notes} fetchnotes={fetchNotes} />
    </div>
  );
}

export default App;
