"use client";

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function NoteList() {
  const { notes, deleteNote } = useContext(AppContext);

  if (notes.length === 0) {
    return <p className="text-gray-500 italic">No notes yet. Add your first note!</p>;
  }

  return (
    <div className="space-y-4">
      {notes.map(note => (
        <div key={note.id} className="bg-white p-4 rounded-md shadow-md">
          <div className="flex justify-between items-start">
            <div className="whitespace-pre-wrap">{note.content}</div>
            <button 
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(note.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}