"use client";

import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiPlusCircle } from 'react-icons/fi';

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
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows="4"
        placeholder="Write your note here..."
        required
      ></textarea>
      <button 
        type="submit" 
        className="mt-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1 w-auto"
      >
        <FiPlusCircle className="h-5 w-5" />
        <span>Add Note</span>
      </button>
    </form>
  );
}