import React, { useState } from 'react';
import axios from 'axios';
import EditableNote from './editnotes';

function NotesList({ notes, fetchnotes }) {
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (id, title, transcription) => {
    await axios.put(`http://localhost:5000/updatenote/${id}`, {
      title,
      text: transcription,
    });
    setEditingId(null);
    fetchnotes();
  };

  const handledelete=async(id)=>{
    try{
      await axios.delete(`http://localhost:5000/deletenode/${id}`);
      fetchnotes();
      }catch(err){
        console.error('Failed to delete node',err);
      }
    };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-300">
        Saved Notes
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {notes.map((note) => (
          <EditableNote
            key={note.id}
            note={note}
            isEditing={editingId === note.id}
            onEdit={() => setEditingId(note.id)}
            onSave={handleSave}
            onDelete={() => handledelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default NotesList;
