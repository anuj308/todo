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
    <div className="min-h-screen bg-black text-white">
      <header className="w-full p-4 flex justify-end items-center">
        <Clock />
        <ThemeToggle />
      </header>
      <main className="container mx-auto px-4">
        {/* <NoteForm/>
        <NoteList/> */}
      </main>
    </div>
  );
}
