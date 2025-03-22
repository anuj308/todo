"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

// Import components with SSR disabled to prevent hydration errors
const Clock = dynamic(() => import('./components/Clock'), { ssr: false });
const ThemeToggle = dynamic(() => import('./components/ThemeToggle'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing on server-side
  }

  return (
    <main className="min-h-screen transition-colors duration-300">
      {/* Header with Title and Clock */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-md">
        <div className="container mx-auto p-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-3 sm:mb-0 dark:text-white">
            Notes & Todo App
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Clock />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
              Notes
            </h2>
            <NoteForm />
            <div className="mt-6 overflow-auto max-h-[calc(100vh-300px)]">
              <NoteList />
            </div>
          </section>

          {/* Todo Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
              Todo List
            </h2>
            <TodoForm />
            <div className="mt-6 overflow-auto max-h-[calc(100vh-300px)]">
              <TodoList />
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-4 text-gray-500 dark:text-gray-400 mt-8">
        <p>Stay organized and productive!</p>
      </footer>
    </main>
  );
}