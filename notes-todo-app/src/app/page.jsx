"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

const Clock = dynamic(() => import("./components/Clock"), { ssr: false });
const ThemeToggle = dynamic(() => import("./components/ThemeToggle"), {
  ssr: false,
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-950 transition-all duration-500">
      {/* Updated Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/30 dark:border-gray-800/30">
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg group transition-all duration-300 hover:shadow-violet-500/25">
                {/* <svg className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg> */}
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Taskify
              </h1>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex items-center justify-center px-8 space-x-8">
              <a
                href="#notes"
                className="flex items-center space-x-2 text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400 transition-colors"
              >
                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg> */}
                <span className="font-medium">Notes</span>
              </a>
              <a
                href="#todos"
                className="flex items-center space-x-2 text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400 transition-colors"
              >
                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg> */}
                <span className="font-medium">Todos</span>
              </a>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg> */}
                <Clock />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with Updated Colors */}
      <main className="container mx-auto px-4 py-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <section
            id="notes"
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100/20 dark:border-gray-700/20 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300"
          >
            <NoteForm />
            <NoteList />
          </section>

          <section
            id="todos"
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100/20 dark:border-gray-700/20 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300"
          >
            <TodoForm />
            <TodoList />
          </section>
        </div>
      </main>

      {/* Rest of your existing code... */}
    </div>
  );
}
