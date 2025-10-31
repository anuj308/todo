import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFolders } from './FoldersContext';
import * as noteService from '../services/noteService';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notesList, setNotesList] = useState([]); // Titles and metadata only
  const [activeNote, setActiveNote] = useState(null); // Full note content
  const [listLoading, setListLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const { selectedFolder } = useFolders();

  // Fetch notes list
  const fetchNotesList = async () => {
    if (!user) return;
    
    setListLoading(true);
    setError(null);
    try {
      const data = await noteService.getNotesList();
      setNotesList(data);
    } catch (err) {
      console.error('Error fetching notes list:', err);
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // Fetch single note by ID
  const fetchNoteById = async (noteId) => {
    if (!user) return null;
    
    setNoteLoading(true);
    setError(null);
    try {
      const note = await noteService.getNoteById(noteId);
      setActiveNote(note);
      return note;
    } catch (err) {
      console.error('Error fetching note:', err);
      setError(err.message);
      return null;
    } finally {
      setNoteLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData) => {
    if (!user) return null;
    
    setListLoading(true);
    setError(null);
    try {
      const newNote = await noteService.createNote(noteData);
      setNotesList(prev => [newNote, ...prev]);
      setActiveNote(newNote);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err.message);
      return null;
    } finally {
      setListLoading(false);
    }
  };

  // Update a note
  const updateNote = async (noteId, updates) => {
    if (!user) return null;
    
    setError(null);
    try {
      const updatedNote = await noteService.updateNote(noteId, updates);
      
      // Update in list
      setNotesList(prev => prev.map(note => 
        (note.id === noteId || note._id === noteId) ? updatedNote : note
      ));
      
      // Update active note if it's the one being updated
      if (activeNote && (activeNote.id === noteId || activeNote._id === noteId)) {
        setActiveNote(updatedNote);
      }
      
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err.message);
      return null;
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    if (!user) return false;
    
    setListLoading(true);
    setError(null);
    try {
      await noteService.deleteNote(noteId);
      
      setNotesList(prev => prev.filter(note => 
        note.id !== noteId && note._id !== noteId
      ));
      
      // Clear active note if it was deleted
      if (activeNote && (activeNote.id === noteId || activeNote._id === noteId)) {
        setActiveNote(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message);
      return false;
    } finally {
      setListLoading(false);
    }
  };

  // Search notes
  const performSearch = async (query) => {
    if (!user) return;
    
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is cleared, fetch all notes
      await fetchNotesList();
      return;
    }
    
    setListLoading(true);
    setError(null);
    try {
      const results = await noteService.searchNotes(query);
      setNotesList(results);
    } catch (err) {
      console.error('Error searching notes:', err);
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // Move note to different folder
  const moveNoteToFolder = async (noteId, folderId) => {
    if (!user) return null;
    
    setError(null);
    try {
      const updatedNote = await noteService.moveNoteToFolder(noteId, folderId);
      
      // Update in list
      setNotesList(prev => prev.map(note => 
        (note.id === noteId || note._id === noteId) ? updatedNote : note
      ));
      
      // Update active note if it's the one being moved
      if (activeNote && (activeNote.id === noteId || activeNote._id === noteId)) {
        setActiveNote(updatedNote);
      }
      
      return updatedNote;
    } catch (err) {
      console.error('Error moving note:', err);
      setError(err.message);
      return null;
    }
  };

  // Get filtered notes for current folder
  const getFilteredNotes = () => {
    if (!selectedFolder) return notesList;
    
    return notesList.filter(note => 
      note.folderId === selectedFolder.id || note.folderId === selectedFolder._id
    );
  };

  // Load notes when user logs in
  useEffect(() => {
    if (user) {
      fetchNotesList();
    } else {
      setNotesList([]);
      setActiveNote(null);
    }
  }, [user]);

  // Refresh notes list when folder changes
  useEffect(() => {
    if (user && selectedFolder) {
      fetchNotesList();
    }
  }, [selectedFolder]);

  const value = {
    notesList,
    activeNote,
    setActiveNote,
    listLoading,
    noteLoading,
    error,
    searchQuery,
    fetchNotesList,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    performSearch,
    moveNoteToFolder,
    getFilteredNotes,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};
