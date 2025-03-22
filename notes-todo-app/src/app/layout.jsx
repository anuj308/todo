import './globals.css';
import { AppProvider } from './context/AppContext';

export const metadata = {
  title: 'Notes & Todo App',
  description: 'A simple notes and todo application built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}