import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Utility function to normalize note objects (convert _id to id if needed)
const normalizeNote = (note) => {
  if (!note) return null;
  
  // If note already has id property, return as is
  if (note.id) return note;
  
  // If note has _id but no id, create a copy with both properties
  if (note._id) {
    return {
      ...note,
      id: note._id // Add id property while keeping _id
    };
  }
  
  // If neither id nor _id exists, return as is (will be filtered out later)
  return note;
};

// Normalize array of notes
const normalizeNotes = (notes) => {
  if (!Array.isArray(notes)) return [];
  return notes.map(normalizeNote).filter(note => note && (note.id || note._id));
};

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const API_URL = getBaseUrl();

  // Fetch all notes from API
  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching notes from:', `${API_URL}/notes`);
      const response = await fetch(`${API_URL}/notes`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch notes, status:', response.status);
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Notes fetched successfully (raw):', data);
      
      // Normalize the notes to ensure they have id property
      const normalizedNotes = normalizeNotes(data);
      console.log('Normalized notes:', normalizedNotes);
      
      setNotes(normalizedNotes);
      
      // If we have notes but no active note, set the first one as active
      if (normalizedNotes.length > 0 && !activeNote) {
        setActiveNote(normalizedNotes[0]);
      }
      
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search notes
  const searchNotes = async (query) => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/notes/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to search notes');
      }
      const data = await response.json();
      const normalizedNotes = normalizeNotes(data);
      setNotes(normalizedNotes);
      return normalizedNotes;
    } catch (err) {
      console.error('Error searching notes:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific note by ID
  const fetchNoteById = async (id) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/notes/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch note');
      }
      const data = await response.json();
      return normalizeNote(data);
    } catch (err) {
      console.error(`Error fetching note ${id}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load all notes when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Add a new note
  const addNote = async (title) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      const newNote = {
        title,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Creating new note with data:', newNote);
      console.log('API URL for new note:', `${API_URL}/notes`);
      
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newNote),
      });
      
      if (!response.ok) {
        console.error('Failed to create note, status:', response.status);
        throw new Error(`Failed to create note: ${response.status}`);
      }
      
      const createdNote = await response.json();
      console.log('Note created successfully with response:', createdNote);
      
      // Normalize to ensure it has id property
      const normalizedNote = normalizeNote(createdNote);
      
      // Make sure the created note has an ID before adding it to state
      if (!normalizedNote.id) {
        console.error('Backend returned a note without a valid ID:', normalizedNote);
        throw new Error('Created note is missing an ID');
      }
      
      // Update notes state with the new note from backend
      setNotes(prevNotes => [normalizedNote, ...prevNotes]);
      
      // Set the newly created note as active
      setActiveNote(normalizedNote);
      
      return normalizedNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const updateNote = async (id, updates) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      // First find the current note to merge updates properly
      const currentNote = notes.find(note => note.id === id);
      
      if (!currentNote) {
        throw new Error('Note not found');
      }
      
      // Prepare the update with merged data
      // Use _id for API call if it exists
      const noteId = currentNote._id || id;
      const updatedData = {
        ...currentNote,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Remove id if _id exists to avoid duplicate IDs in the database
      if (updatedData._id && updatedData.id) {
        // Keep only _id for the API call
        const { id, ...dataWithoutId } = updatedData;
        
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(dataWithoutId),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update note');
        }
        
        const updatedFromApi = await response.json();
        const normalizedUpdatedNote = normalizeNote(updatedFromApi);
        
        // Update notes list
        setNotes(prevNotes => 
          prevNotes.map(note => note.id === id ? normalizedUpdatedNote : note)
        );
        
        // Update active note if this is the one being edited
        if (activeNote && activeNote.id === id) {
          setActiveNote(normalizedUpdatedNote);
        }
        
        return normalizedUpdatedNote;
      } else {
        // No _id present, proceed with id
        const response = await fetch(`${API_URL}/notes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(updatedData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update note');
        }
        
        const updatedFromApi = await response.json();
        const normalizedUpdatedNote = normalizeNote(updatedFromApi);
        
        // Update notes list
        setNotes(prevNotes => 
          prevNotes.map(note => note.id === id ? normalizedUpdatedNote : note)
        );
        
        // Update active note if this is the one being edited
        if (activeNote && activeNote.id === id) {
          setActiveNote(normalizedUpdatedNote);
        }
        
        return normalizedUpdatedNote;
      }
    } catch (err) {
      console.error(`Error updating note ${id}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      // Find the note to get its _id if available
      const noteToDelete = notes.find(note => note.id === id);
      if (!noteToDelete) {
        throw new Error('Note not found');
      }
      
      // Use _id for API call if available, otherwise use id
      const noteId = noteToDelete._id || id;
      
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      // First update the notes state to remove the deleted note
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      
      // Then handle activeNote state updates
      if (activeNote && activeNote.id === id) {
        setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting note ${id}:`, err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Select a note to view/edit
  const selectNote = async (id) => {
    if (!user) return;
    
    // Don't attempt to fetch if id is undefined or null
    if (!id) {
      console.warn("Attempted to select a note with undefined or null ID");
      return;
    }
    
    try {
      // Find note in current state first to get _id if available
      const noteInState = notes.find(note => note.id === id);
      const noteId = noteInState?._id || id;
      
      const note = await fetchNoteById(noteId);
      if (note) {
        setActiveNote(note);
      }
    } catch (err) {
      console.error(`Error selecting note ${id}:`, err);
      setError(err.message);
    }
  };

  return (
    <NotesContext.Provider value={{ 
      notes, 
      activeNote,
      loading,
      error, 
      fetchNotes,
      searchNotes,
      addNote, 
      updateNote, 
      deleteNote, 
      selectNote 
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};