import { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [notesList, setNotesList] = useState([]); // Only titles and metadata
  const [activeNote, setActiveNote] = useState(null); // Full note content
  const [listLoading, setListLoading] = useState(false); // For notes list operations
  const [noteLoading, setNoteLoading] = useState(false); // For individual note loading
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const API_URL = getBaseUrl();

  // Fetch notes list (optimized - titles only)
  const fetchNotesList = async () => {
    if (!user) return;
    
    setListLoading(true);
    setError(null);
    try {
      console.log('Fetching notes list from:', `${API_URL}/notes/list`);
      const response = await fetch(`${API_URL}/notes/list`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch notes list, status:', response.status);
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Notes list fetched successfully:', data);
      
      // Normalize the notes to ensure they have id property
      const normalizedNotes = normalizeNotes(data);
      console.log('Normalized notes list:', normalizedNotes);
      
      setNotesList(normalizedNotes);
      
    } catch (err) {
      console.error('Error fetching notes list:', err);
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // Manual refresh function for when needed
  const refreshNotesList = async () => {
    console.log('Manual refresh of notes list requested');
    await fetchNotesList();
  };

  // Search notes
  const searchNotes = async (query) => {
    if (!user) return [];
    
    setListLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/notes/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to search notes');
      }
      const data = await response.json();
      const normalizedNotes = normalizeNotes(data);
      setNotesList(normalizedNotes); // Update list with search results
      return normalizedNotes;
    } catch (err) {
      console.error('Error searching notes:', err);
      setError(err.message);
      return [];
    } finally {
      setListLoading(false);
    }
  };

  // Fetch a specific note by ID
  const fetchNoteById = async (id) => {
    if (!user) return null;
    
    setNoteLoading(true);
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
      setNoteLoading(false);
    }
  };

  // Load notes list when component mounts and user is authenticated
  useEffect(() => {
    if (user && notesList.length === 0) {
      // Only fetch if we don't already have notes loaded
      fetchNotesList();
    }
  }, [user]);

  // Add a new note
  const addNote = async (title, folderId = null) => {
    if (!user) return null;
    
    setListLoading(true);
    setError(null);
    try {
      const newNote = {
        title,
        content: '',
        folderId,
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
      
      // Update notes list with the new note from backend  
      setNotesList(prevNotes => [normalizedNote, ...prevNotes]);
      
      // Set the newly created note as active
      setActiveNote(normalizedNote);
      
      return normalizedNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err.message);
      return null;
    } finally {
      setListLoading(false);
    }
  };

  // Update an existing note (SUPER OPTIMIZED - only update list if metadata changes)
  const updateNote = async (id, updates) => {
    if (!user) return null;
    
    setError(null);
    try {
      // First find the current note in the list
      const currentNoteInList = notesList.find(note => note.id === id);
      
      if (!currentNoteInList) {
        throw new Error('Note not found');
      }
      
      // Prepare the update with merged data
      // Use _id for API call if it exists
      const noteId = currentNoteInList._id || id;
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Check if this update affects the sidebar (title, tags, isPinned, etc.)
      const sidebarRelevantFields = ['title', 'tags', 'isPinned', 'order', 'folderId'];
      const shouldUpdateList = sidebarRelevantFields.some(field => 
        field in updates && updates[field] !== currentNoteInList[field]
      );
      
      console.log('Update affects sidebar:', shouldUpdateList, { updates, currentNote: currentNoteInList });
      
      // Optimistic update - update active note if it's the one being updated
      if (activeNote && activeNote.id === id) {
        const optimisticNote = normalizeNote({ ...activeNote, ...updatedData });
        setActiveNote(optimisticNote);
      }
      
      // Only update the note list if sidebar-relevant metadata changed
      if (shouldUpdateList) {
        console.log('Updating notes list with new metadata');
        setNotesList(prevNotes => 
          prevNotes.map(note => 
            note.id === id 
              ? { ...note, ...updatedData, content: undefined } // Remove content from list
              : note
          )
        );
      } else {
        console.log('Skipping notes list update - only content changed');
      }
      
      // Save to backend
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        // Revert optimistic updates on error
        if (activeNote && activeNote.id === id) {
          setActiveNote(activeNote); // Keep current active note
        }
        if (shouldUpdateList) {
          setNotesList(prevNotes => 
            prevNotes.map(note => note.id === id ? currentNoteInList : note)
          );
        }
        throw new Error(`Failed to update note: ${response.status}`);
      }
      
      const updatedFromApi = await response.json();
      const normalizedUpdatedNote = normalizeNote(updatedFromApi);
      
      // Update active note with server response if it's the current one
      if (activeNote && activeNote.id === id) {
        setActiveNote(normalizedUpdatedNote);
      }
      
      // Only update notes list with server response if we updated it earlier
      if (shouldUpdateList) {
        console.log('Updating notes list with server response');
        setNotesList(prevNotes => 
          prevNotes.map(note => 
            note.id === id 
              ? { ...normalizedUpdatedNote, content: undefined }
              : note
          )
        );
      }
      
      return normalizedUpdatedNote;
    } catch (err) {
      console.error(`Error updating note ${id}:`, err);
      setError(err.message);
      throw err; // Re-throw so the caller can handle it
    }
  };

  // Delete a note (OPTIMIZED)
  const deleteNote = async (id) => {
    if (!user) return false;
    
    setError(null);
    try {
      // Find the note to get its _id if available
      const noteToDelete = notesList.find(note => note.id === id);
      if (!noteToDelete) {
        throw new Error('Note not found');
      }
      
      // Use _id for API call if available, otherwise use id
      const noteId = noteToDelete._id || id;
      
      // Optimistic update - remove from list immediately
      const updatedNotes = notesList.filter(note => note.id !== id);
      setNotesList(updatedNotes);
      
      // Handle activeNote state updates
      if (activeNote && activeNote.id === id) {
        // Auto-select the next note if available
        const nextNote = updatedNotes.length > 0 ? updatedNotes[0] : null;
        if (nextNote) {
          selectNote(nextNote.id);
        } else {
          setActiveNote(null);
        }
      }
      
      // Send delete request to backend
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Revert optimistic update on error
        setNotesList(notesList);
        if (activeNote && activeNote.id === id) {
          setActiveNote(activeNote);
        }
        throw new Error('Failed to delete note');
      }
      
      console.log(`Note ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error(`Error deleting note ${id}:`, err);
      setError(err.message);
      return false;
    }
  };

  // Clear active note (useful when changing folders)
  const clearActiveNote = useCallback(() => {
    setActiveNote(null);
  }, []);

  // Select a note to view/edit (loads full content only, no list update)
  const selectNote = async (id) => {
    if (!user) return;
    
    // Don't attempt to fetch if id is undefined or null
    if (!id) {
      console.warn("Attempted to select a note with undefined or null ID");
      return;
    }
    
    // If already selected, don't reload
    if (activeNote && activeNote.id === id) {
      return;
    }

    try {
      // Find note in current list to get _id if available
      const noteInList = notesList.find(note => note.id === id);
      const noteId = noteInList?._id || id;
      
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
      notes: notesList, // For backward compatibility  
      notesList, // Explicit list state
      activeNote,
      listLoading, // Loading state for notes list operations
      noteLoading, // Loading state for individual note content
      loading: listLoading, // For backward compatibility
      error, 
      fetchNotesList,
      refreshNotesList, // Manual refresh when needed
      searchNotes,
      addNote, 
      updateNote, 
      deleteNote, 
      selectNote,
      clearActiveNote // Clear active note when needed
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