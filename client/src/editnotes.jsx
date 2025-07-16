import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

function EditableNote({ note, isEditing, onEdit, onSave, ondelete }) {
  const [title, setTitle] = useState(note.title);
  const [transcription, setTranscription] = useState(note.transcription);

  useEffect(() => {
    setTitle(note.title);
    setTranscription(note.transcription);
  }, [note]);

  const exportAsTxt = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'note'}.txt`;
    link.click();
  };

  const exportAsPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 10, 20);
    doc.setFontSize(12);
    doc.text(transcription, 10, 30);
    doc.save(`${title || 'note'}.pdf`);
  };

  return (
   <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md transition duration-300">
      {isEditing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-2 px-3 py-1 border rounded dark:bg-gray-700"
          />
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full mb-2 px-3 py-1 border rounded dark:bg-gray-700"
          />
          <button
            onClick={() => onSave(note.id, title, transcription)}
            className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
            {note.title}
          </h3>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
            {note.transcription}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onEdit}
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={exportAsTxt}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              TXT
            </button>
            <button
              onClick={exportAsPdf}
              className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
            >
              PDF
            </button>
            <button
              onClick={ondelete}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EditableNote;
