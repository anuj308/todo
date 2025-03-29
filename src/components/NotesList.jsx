import { useNotes } from '../context/NotesContext';
import NoteItem from './NoteItem';
import { FaPlus } from 'react-icons/fa';
import { useEffect } from 'react';

function NotesList() {
  const { notes, addNote, fetchNotes, loading, error } = useNotes();

  // Additional fetch on component mount to ensure we have the latest data
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = () => {
    addNote('New Note');
  };
  
  console.log('Current notes in NotesList:', notes);

  return (
    <div className="notes-sidebar">
      <div className="notes-header">
        <h2>My Notes</h2>
        <div className="notes-actions">
          <button 
            className="add-note-btn"
            onClick={handleAddNote}
            disabled={loading}
            aria-label="Add note"
          >
            <FaPlus /> Add Note
          </button>
        </div>
      </div>
      
      {error && (
        <div className="notes-error">
          Error: {error}
        </div>
      )}
      
      <div className="notes-list">
        {loading && notes.length === 0 ? (
          <p className="loading-notes">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="no-notes">No notes yet. Create one!</p>
        ) : (
          notes.map(note => {
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