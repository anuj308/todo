"use client";

import { useState, useEffect } from 'react';

export default function Clock() {
  const [date, setDate] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setDate(new Date());
    
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Only render the clock after component has mounted on the client
  if (!mounted || !date) {
    return <div className="text-right h-12"></div>; // Empty placeholder with same height
  }

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="inline-block p-10 text-right">
      <span className="inline-block p-10 text-sm text-gray-600">{formattedDate}</span>
      <span className="text-xl font-semibold">{formattedTime}</span>
    </div>
  );
}