"use client";

import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function NoteForm() {
  const [content, setContent] = useState('');
  const { addNote } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      addNote(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows="4"
        placeholder="Write your note here..."
        required
      ></textarea>
      <button 
        type="submit" 
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        Add Note
      </button>
    </form>
  );
}