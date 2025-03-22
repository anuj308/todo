"use client";

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FiCheck, FiTrash, FiCalendar } from 'react-icons/fi';

export default function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useContext(AppContext);

  if (todos.length === 0) {
    return <p className="text-gray-500 italic flex items-center"><FiCalendar className="mr-2" /> No tasks yet. Add your first task!</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li 
          key={todo.id} 
          className={`flex items-center justify-between bg-white p-3 rounded-md shadow-sm dark:bg-gray-700/80 ${todo.completed ? 'bg-gray-50 dark:bg-gray-800/60' : ''}`}
        >
          <div className="flex items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 rounded border-gray-300 dark:border-gray-600 hidden"
                id={`todo-${todo.id}`}
              />
              <label 
                htmlFor={`todo-${todo.id}`} 
                className={`flex items-center justify-center w-5 h-5 border rounded cursor-pointer ${
                  todo.completed 
                    ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {todo.completed && <FiCheck className="text-white" size={12} />}
              </label>
            </div>
            <span 
              className={`ml-3 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
            >
              {todo.text}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3 flex items-center">
              <FiCalendar className="mr-1" size={12} />
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <FiTrash size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}