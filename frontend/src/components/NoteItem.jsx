import { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { FaTrash } from 'react-icons/fa';

function NoteItem({ note }) {
  const { selectNote, deleteNote, activeNote } = useNotes();
  const [isHovering, setIsHovering] = useState(false);
  
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
    if (!content) return '';
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (noteId) {
      deleteNote(noteId);
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
        <p className="note-preview">{truncateContent(note.content)}</p>
        <span className="note-date">{formattedDate}</span>
      </div>
      {isHovering && (
        <button 
          className="delete-note-btn" 
          onClick={handleDelete}
          aria-label="Delete note"
        >
          <FaTrash />
        </button>
      )}
    </div>
  );
}

export default NoteItem;