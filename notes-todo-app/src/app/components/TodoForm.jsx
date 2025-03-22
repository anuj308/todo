"use client";

import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function TodoForm() {
  const [text, setText] = useState('');
  const { addTodo } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a new task..."
        required
      />
      <button 
        type="submit" 
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-r-md transition-colors"
      >
        Add
      </button>
    </form>
  );
}