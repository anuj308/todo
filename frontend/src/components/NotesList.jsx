import { useNotes } from '../context/NotesContext';
import { useFolders } from '../context/FoldersContext';
import NoteItem from './NoteItem';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useEffect, useState } from 'react';

function NotesList() {
  const { notes, addNote, fetchNotes, loading, error, searchNotes } = useNotes();
  const { selectedFolder, getFolderNotes } = useFolders();
  const [folderNotes, setFolderNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch notes for selected folder
  useEffect(() => {
    const loadFolderNotes = async () => {
      if (selectedFolder) {
        setIsSearching(true);
        try {
          const data = await getFolderNotes(selectedFolder.id);
          setFolderNotes(data.notes || []);
        } catch (error) {
          console.error('Error loading folder notes:', error);
          setFolderNotes([]);
        } finally {
          setIsSearching(false);
        }
      }
    };

    loadFolderNotes();
  }, [selectedFolder, getFolderNotes]);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchNotes(searchQuery);
          setFolderNotes(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else if (selectedFolder) {
        // Reset to folder notes when search is cleared
        const data = await getFolderNotes(selectedFolder.id);
        setFolderNotes(data.notes || []);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFolder, searchNotes, getFolderNotes]);

  const handleAddNote = () => {
    const folderId = selectedFolder?.id || null;
    addNote('New Note', folderId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const displayNotes = searchQuery ? folderNotes : (selectedFolder ? folderNotes : notes);
  const isLoading = loading || isSearching;

  return (
    <div className="notes-sidebar">
      <div className="notes-header">
        <div className="header-title">
          <h2>{selectedFolder ? selectedFolder.name : 'All Notes'}</h2>
          <span className="notes-count">
            {displayNotes.length} {displayNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <div className="notes-actions">
          <button 
            className="add-note-btn"
            onClick={handleAddNote}
            disabled={isLoading}
            aria-label="Add note"
            title={`Add note to ${selectedFolder?.name || 'default folder'}`}
          >
            <FaPlus /> Add Note
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
    </div>
  );
}

export default NotesList;