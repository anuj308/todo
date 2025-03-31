import { useNotes } from '../context/NotesContext';
import { useState, useEffect, useRef } from 'react';

function NoteEditor() {
  const { activeNote, updateNote, error, loading } = useNotes();
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveTimeout, setSaveTimeout] = useState(null);
  // Refs for cursor position tracking
  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  // Refs for storing cursor positions
  const titleSelectionRef = useRef(null);
  const contentSelectionRef = useRef(null);
  // Ref for tracking if a save is in progress
  const saveInProgressRef = useRef(false);

  // Sync local state with activeNote
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title || '');
      setLocalContent(activeNote.content || '');
      
      // Auto-focus content area when a note is selected
      setTimeout(() => {
        if (contentTextareaRef.current) {
          contentTextareaRef.current.focus();
        }
      }, 50);
    } else {
      setLocalTitle('');
      setLocalContent('');
    }
    // Clear any previous save status
    setSaveStatus('');
  }, [activeNote]);

  // Function to store current cursor position
  const storeCursorPosition = (inputRef, selectionRef) => {
    if (inputRef.current) {
      selectionRef.current = {
        start: inputRef.current.selectionStart,
        end: inputRef.current.selectionEnd,
      };
    }
  };

  // Function to restore cursor position
  const restoreCursorPosition = (inputRef, selectionRef) => {
    if (inputRef.current && selectionRef.current) {
      inputRef.current.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end
      );
    }
  };

  const handleTitleChange = (e) => {
    storeCursorPosition(titleInputRef, titleSelectionRef);
    setLocalTitle(e.target.value);
    scheduleSave({ title: e.target.value, content: localContent });
  };

  const handleContentChange = (e) => {
    storeCursorPosition(contentTextareaRef, contentSelectionRef);
    setLocalContent(e.target.value);
    scheduleSave({ title: localTitle, content: e.target.value });
  };

  // Debounced save function with non-blocking UI
  const scheduleSave = (updates) => {
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Don't try to save if no active note or if active note has no ID
    if (!activeNote || !activeNote.id) {
      return;
    }

    // Set a subtle "Unsaved changes" indicator without freezing UI
    if (!saveInProgressRef.current) {
      setSaveStatus('Unsaved changes');
    }
    
    // Set new timeout for saving
    const timeoutId = setTimeout(async () => {
      // Mark save as in progress to prevent UI disruption
      saveInProgressRef.current = true;
      
      try {
        // Perform the save operation in the background
        const result = await updateNote(activeNote.id, updates);
        
        if (result) {
          // Show success indicator briefly, then fade out
          setSaveStatus('Saved');
          setTimeout(() => {
            if (saveStatus === 'Saved') {
              setSaveStatus('');
            }
          }, 1000); // Clear "Saved" message after 1 second
        }
      } catch (err) {
        console.error('Error saving note:', err);
        setSaveStatus('Error saving');
      } finally {
        // Mark save as complete
        saveInProgressRef.current = false;
        
        // Restore cursor position after save completes
        // Using setTimeout to ensure this happens after React updates
        setTimeout(() => {
          if (titleInputRef.current === document.activeElement) {
            restoreCursorPosition(titleInputRef, titleSelectionRef);
          } else if (contentTextareaRef.current === document.activeElement) {
            restoreCursorPosition(contentTextareaRef, contentSelectionRef);
          }
        }, 0);
      }
    }, 800); // 800ms debounce - slightly longer to reduce save frequency

    setSaveTimeout(timeoutId);
  };

  // Focus management when user clicks into title or content fields
  const handleFocus = (inputRef, selectionRef) => {
    // When focusing, store the current cursor position
    setTimeout(() => {
      storeCursorPosition(inputRef, selectionRef);
    }, 0);
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
          ref={titleInputRef}
          onFocus={() => handleFocus(titleInputRef, titleSelectionRef)}
        />
      </div>
      <div className="editor-content">
        <textarea
          className="note-content-input"
          value={localContent}
          onChange={handleContentChange}
          placeholder="Start typing your note here..."
          disabled={loading}
          ref={contentTextareaRef}
          onFocus={() => handleFocus(contentTextareaRef, contentSelectionRef)}
        />
      </div>
      <div className="editor-footer">
        <span className="last-updated">
          Last updated: {new Date(activeNote.updatedAt).toLocaleString()}
        </span>
        {saveStatus && (
          <span className={`save-status ${
            saveStatus.includes('Error') ? 'error' : 
            saveStatus === 'Saved' ? 'success' : 
            saveStatus === 'Unsaved changes' ? 'pending' : ''
          }`}>
            {saveStatus}
          </span>
        )}
        {error && <span className="error-message">Error: {error}</span>}
      </div>
    </div>
  );
}

export default NoteEditor;