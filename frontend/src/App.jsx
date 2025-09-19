import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import LoginSignUpPage from './components/LoginSignUpPage';
import NotesPage from './components/NotesPage';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="app-container">
                    {!isLoginPage && <Navbar />}
                    <div className="content-container">
                        <Routes>
                            <Route 
                                path="/" 
                                element={
                                    <RedirectIfAuthenticated>
                                        <LoginSignUpPage />
                                    </RedirectIfAuthenticated>
                                } 
                            />
                            <Route 
                                path="/notes" 
                                element={
                                    <ProtectedRoute>
                                        <NotesPage />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/todo" 
                                element={
                                    <ProtectedRoute>
                                        <TodoProvider>
                                            <TodoForm />
                                            <TodoList />
                                        </TodoProvider>
                                    </ProtectedRoute>
                                } 
                            />
                            {/* Catch-all route to redirect undefined routes to home page */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
