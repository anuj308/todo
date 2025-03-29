import { useNotes } from '../context/NotesContext';
import { useState, useEffect } from 'react';

function NoteEditor() {
  const { activeNote, updateNote, error, loading } = useNotes();
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveTimeout, setSaveTimeout] = useState(null);

  // Sync local state with activeNote
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title || '');
      setLocalContent(activeNote.content || '');
    } else {
      setLocalTitle('');
      setLocalContent('');
    }
    // Clear any previous save status
    setSaveStatus('');
  }, [activeNote]);

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    // Schedule save
    scheduleSave({ title: e.target.value, content: localContent });
  };

  const handleContentChange = (e) => {
    setLocalContent(e.target.value);
    // Schedule save
    scheduleSave({ title: localTitle, content: e.target.value });
  };

  // Debounced save function
  const scheduleSave = (updates) => {
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Don't try to save if no active note or if active note has no ID
    if (!activeNote || !activeNote.id) {
      setSaveStatus('Cannot save - no valid note selected');
      return;
    }

    setSaveStatus('Saving...');
    
    // Set new timeout for saving
    const timeoutId = setTimeout(async () => {
      try {
        const result = await updateNote(activeNote.id, updates);
        if (result) {
          setSaveStatus('Saved');
        } else {
          setSaveStatus('Failed to save');
        }
      } catch (err) {
        setSaveStatus('Error saving');
        console.error('Error saving note:', err);
      }
    }, 500); // 500ms debounce

    setSaveTimeout(timeoutId);
  };

  if (!activeNote) {
    return (
      <div className="note-editor empty-editor">
        <p>Select a note or create a new one to get started</p>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          className="note-title-input"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Note title"
          disabled={loading}
        />
      </div>
      <div className="editor-content">
        <textarea
          className="note-content-input"
          value={localContent}
          onChange={handleContentChange}
          placeholder="Start typing your note here..."
          disabled={loading}
        />
      </div>
      <div className="editor-footer">
        <span className="last-updated">
          Last updated: {new Date(activeNote.updatedAt).toLocaleString()}
        </span>
        {saveStatus && (
          <span className={`save-status ${saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'error' : ''}`}>
            {saveStatus}
          </span>
        )}
        {error && <span className="error-message">Error: {error}</span>}
      </div>
    </div>
  );
}

export default NoteEditor;