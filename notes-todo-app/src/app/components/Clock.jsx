"use client";

import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <FiClock className="w-4 h-4" />
      <span>{formattedTime}</span>
    </div>
  );
}