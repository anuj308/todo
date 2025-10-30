import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import LoginSignUpPage from './components/LoginSignUpPage';
import NotesPage from './components/NotesPage';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import CalendarPage from './components/CalendarPage';
import DiaryPage from './components/DiaryPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import { FoldersProvider } from './context/FoldersContext';
import { CalendarProvider } from './context/CalendarContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    
    return (
        <ThemeProvider>
            <AuthProvider>
                <FoldersProvider>
                    <CalendarProvider>
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
                                    <Route 
                                        path="/calendar" 
                                        element={
                                            <ProtectedRoute>
                                                <CalendarPage />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route 
                                        path="/diary" 
                                        element={
                                            <ProtectedRoute>
                                                <DiaryPage />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route 
                                        path="/analytics" 
                                        element={
                                            <ProtectedRoute>
                                                <AnalyticsPage />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route 
                                        path="/projects" 
                                        element={
                                            <ProtectedRoute>
                                                <ProjectsPage />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route 
                                        path="/settings" 
                                        element={
                                            <ProtectedRoute>
                                                <SettingsPage />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    {/* Catch-all route to redirect undefined routes to home page */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                        </div>
                    </CalendarProvider>
                </FoldersProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
