"use client";

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useContext(AppContext);

  if (todos.length === 0) {
    return <p className="text-gray-500 italic">No tasks yet. Add your first task!</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li 
          key={todo.id} 
          className={`flex items-center justify-between bg-white p-3 rounded-md shadow-sm ${todo.completed ? 'bg-gray-50' : ''}`}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <span 
              className={`ml-3 ${todo.completed ? 'line-through text-gray-500' : ''}`}
            >
              {todo.text}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}