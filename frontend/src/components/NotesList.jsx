import { useNotes } from '../context/NotesContext';
import { useFolders } from '../context/FoldersContext';
import NoteItem from './NoteItem';
import ResizableSidebar from './ResizableSidebar';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import './NotesList.css';

function NotesList() {
  const { notes, addNote, fetchNotesList, listLoading, error, searchNotes, clearActiveNote, selectNote, activeNote } = useNotes();
  const { selectedFolder, getFolderNotes } = useFolders();
  const [folderNotes, setFolderNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const prevFolderRef = useRef(null);
  const prevSearchRef = useRef('');

  // Fetch notes for selected folder
  useEffect(() => {
    const loadFolderNotes = async () => {
      if (selectedFolder) {
        setIsSearching(true);
        
        // Only clear active note when actually changing folders (not on initial load)
        const folderChanged = prevFolderRef.current && prevFolderRef.current.id !== selectedFolder.id;
        if (folderChanged) {
          clearActiveNote();
        }
        prevFolderRef.current = selectedFolder;
        
        try {
          const data = await getFolderNotes(selectedFolder.id);
          setFolderNotes(data.notes || []);
        } catch (error) {
          console.error('Error loading folder notes:', error);
          setFolderNotes([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        // No folder selected, clear the ref
        prevFolderRef.current = null;
      }
    };

    loadFolderNotes();
  }, [selectedFolder?.id, getFolderNotes]); // Removed clearActiveNote from dependencies

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        
        // Only clear active note when starting a new search (not during typing)
        const isNewSearch = prevSearchRef.current === '' && searchQuery.trim() !== '';
        if (isNewSearch) {
          clearActiveNote();
        }
        prevSearchRef.current = searchQuery.trim();
        
        try {
          const results = await searchNotes(searchQuery);
          setFolderNotes(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Search cleared
        prevSearchRef.current = '';
        
        if (selectedFolder) {
          // Reset to folder notes when search is cleared
          const data = await getFolderNotes(selectedFolder.id);
          setFolderNotes(data.notes || []);
        }
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFolder?.id, searchNotes, getFolderNotes]); // Removed clearActiveNote from dependencies

  // Function to determine if a color is light or dark for contrast
  const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return 'white';
    
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const handleAddNote = () => {
    const folderId = selectedFolder?.id || null;
    addNote('New Note', folderId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const displayNotes = searchQuery ? folderNotes : (selectedFolder ? folderNotes : notes);
  const isLoading = isSearching; // Only show loading during search, not during note selection

  return (
    <ResizableSidebar className="notes-sidebar" type="notes">
      <div className="notes-header">
        <div className="header-title">
          <h2>📝 {selectedFolder ? selectedFolder.name : 'All Notes'}</h2>
          <span className="notes-count">
            {displayNotes.length} {displayNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <div className="notes-actions">
          <button 
            className="add-note-btn"
            onClick={handleAddNote}
            disabled={isSearching} // Only disable during search, not during note loading
            aria-label="Add note"
            title={`Add note to ${selectedFolder?.name || 'default folder'}`}
            style={selectedFolder?.color ? { 
              backgroundColor: selectedFolder.color,
              borderColor: selectedFolder.color,
              color: getContrastColor(selectedFolder.color)
            } : {}}
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search in ${selectedFolder?.name || 'all notes'}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="notes-error">
          Error: {error}
        </div>
      )}
      
      <div className="notes-list">
        {isLoading ? (
          <p className="loading-notes">
            {searchQuery ? 'Searching...' : 'Loading notes...'}
          </p>
        ) : displayNotes.length === 0 ? (
          <div className="no-notes">
            {searchQuery ? (
              <div>
                <p>No notes found for "{searchQuery}"</p>
                <button 
                  className="clear-search-link"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              </div>
            ) : selectedFolder ? (
              <div>
                <p>No notes in "{selectedFolder.name}" yet</p>
                <button 
                  className="add-first-note-btn"
                  onClick={handleAddNote}
                >
                  Create your first note
                </button>
              </div>
            ) : (
              <div>
                <p>No notes yet</p>
                <button 
                  className="add-first-note-btn"
                  onClick={handleAddNote}
                >
                  Create your first note
                </button>
              </div>
            )}
          </div>
        ) : (
          displayNotes.map(note => {
            if (!note || !note.id) {
              console.warn('Invalid note data:', note);
              return null;
            }
            return <NoteItem key={note.id} note={note} />;
          })
        )}
      </div>
    </ResizableSidebar>
  );
}

export default NotesList;