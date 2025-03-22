"use client";

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FiTrash2, FiCalendar, FiFileText } from 'react-icons/fi';

export default function NoteList() {
  const { notes, deleteNote } = useContext(AppContext);

  if (notes.length === 0) {
    return <p className="text-gray-500 italic flex items-center"><FiFileText className="mr-2" /> No notes yet. Add your first note!</p>;
  }

  return (
    <div className="space-y-4">
      {notes.map(note => (
        <div key={note.id} className="bg-white p-4 rounded-md shadow-md dark:bg-gray-700/80 relative group">
          <div className="flex justify-between items-start">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{note.content}</div>
            <button 
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <FiCalendar className="mr-1" size={12} />
            {new Date(note.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}