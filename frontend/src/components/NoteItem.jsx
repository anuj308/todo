import { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { FaTrash } from 'react-icons/fa';

function NoteItem({ note }) {
  const { selectNote, deleteNote, activeNote } = useNotes();
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Make sure note has a valid ID (either id or _id)
  if (!note || (!note.id && !note._id)) {
    console.warn('NoteItem received a note without a valid ID');
    return null;
  }
  
  // Use id for comparison (normalized in context)
  const noteId = note.id || note._id;
  const isActive = activeNote && (activeNote.id === noteId || activeNote._id === noteId);
  
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const truncateContent = (content) => {
    if (!content) return 'No preview available';
    // Remove HTML tags and truncate
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!noteId || isDeleting) return;
    
    // Confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${note.title || 'Untitled'}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteNote(noteId);
        if (!success) {
          alert('Failed to delete note. Please try again.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete note. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleNoteClick = () => {
    if (noteId) {
      selectNote(noteId);
    }
  };

  return (
    <div 
      className={`note-item ${isActive ? 'active' : ''}`}
      onClick={handleNoteClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="note-item-content">
        <h3 className="note-title">{note.title || 'Untitled'}</h3>
        <div className="note-metadata">
          <span className="note-date">{formattedDate}</span>
          {note.tags && note.tags.length > 0 && (
            <span className="note-tags-count">{note.tags.length} tags</span>
          )}
        </div>
      </div>
      {(isHovering || isDeleting) && (
        <button 
          className={`delete-note-btn ${isDeleting ? 'deleting' : ''}`}
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete note"
        >
          {isDeleting ? '⏳' : <FaTrash />}
        </button>
      )}
    </div>
  );
}

export default NoteItem;