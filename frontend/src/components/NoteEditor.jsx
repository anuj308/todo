import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNotes } from '../context/NotesContext';
import './NoteEditor.css';

function NoteEditor({ note, onSave, loading }) {
  const { deleteNote } = useNotes();
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const selectionRef = useRef(null);
  const [title, setTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('success');
  const [isDragging, setIsDragging] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [noteSize, setNoteSize] = useState(0);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
    code: false,
    align: 'left',
    heading: 'p'
  });

  // Calculate note size in KB
  const calculateNoteSize = useCallback(() => {
    if (contentRef.current) {
      const content = contentRef.current.innerHTML;
      const sizeInBytes = new Blob([title + content]).size;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      setNoteSize(sizeInKB);
    }
  }, [title]);

  const snapshotSelection = useCallback(() => {
    if (typeof document === 'undefined') return;
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (typeof document === 'undefined') return;
    const selection = document.getSelection();
    if (!selection || !selectionRef.current) return;
    try {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    } catch (error) {
      console.warn('Unable to restore selection', error);
    }
  }, []);

  const focusEditor = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.focus({ preventScroll: false });
      restoreSelection();
    }
  }, [restoreSelection]);

  const updateFormatState = useCallback(() => {
    if (!contentRef.current || typeof document === 'undefined') return;
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setFormatState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        unorderedList: false,
        orderedList: false,
        blockquote: false,
        code: false,
        align: 'left',
        heading: 'p'
      });
      return;
    }
    const anchorNode = selection.anchorNode;
    if (!anchorNode) return;
    if (!contentRef.current.contains(anchorNode)) return;

    try {
      if (selection.rangeCount > 0) {
        selectionRef.current = selection.getRangeAt(0).cloneRange();
      }
      const currentHeadingRaw = document.queryCommandValue('formatBlock') || 'p';
      let currentHeading = currentHeadingRaw.toLowerCase();
      if (currentHeading === 'normal' || currentHeading === 'div') {
        currentHeading = 'p';
      }

      const alignmentState = (() => {
        if (document.queryCommandState('justifyCenter')) return 'center';
        if (document.queryCommandState('justifyRight')) return 'right';
        if (document.queryCommandState('justifyFull')) return 'justify';
        return 'left';
      })();

      setFormatState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
        blockquote: currentHeading === 'blockquote',
        code: currentHeading === 'pre',
        align: alignmentState,
        heading: currentHeading
      });
    } catch (error) {
      console.warn('Unable to update format state', error);
    }
  }, []);

  // Initialize content when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '';
        setLastSavedContent(note.content || ''); // Track the loaded content
        updateImageCount();
        calculateNoteSize();
        updateFormatState();
      }
    } else {
      setTitle('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
        setLastSavedContent('');
        setNoteSize(0);
        updateFormatState();
      }
    }
    // Clear any pending saves when note changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    setSaveStatus('success');
  }, [note]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleSelectionChange = () => {
      updateFormatState();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateFormatState]);

  // Update image count
  const updateImageCount = useCallback(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll('img');
      setImageCount(images.length);
    }
  }, []);

  // Handle content changes and auto-save
  const handleContentChange = useCallback(() => {
    if (contentRef.current && note && note.id) {
      console.log('Auto-save triggered for note:', note.id);
      updateImageCount();
      calculateNoteSize();
      updateFormatState();
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set status to pending only if we're going to save
      setSaveStatus('pending');
      
      // Auto-save with proper debounce (3 seconds)
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Get fresh content and title at save time
          const currentContent = contentRef.current ? contentRef.current.innerHTML : '';
          const currentTitle = title;
          
          // Check if content actually changed since last save
          if (currentContent === lastSavedContent && currentTitle === (note.title || '')) {
            console.log('Skipping auto-save - no changes detected');
            setSaveStatus('success');
            saveTimeoutRef.current = null;
            return;
          }
          
          console.log('Executing auto-save...', { 
            title: currentTitle, 
            contentLength: currentContent.length,
            contentChanged: currentContent !== lastSavedContent,
            titleChanged: currentTitle !== (note.title || '')
          });
          
          await onSave(note.id, { title: currentTitle, content: currentContent });
          setLastSavedContent(currentContent); // Update last saved content
          setSaveStatus('success');
          console.log('Auto-save successful');
        } catch (error) {
          console.error('Error saving note:', error);
          if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
            setSaveStatus('error');
            alert('Note is too large to save. Try reducing image sizes or removing some images.');
          } else {
            setSaveStatus('error');
          }
        }
        saveTimeoutRef.current = null;
      }, 3000); // Increased to 3 seconds to reduce server load
    } else {
      console.log('Auto-save not triggered:', { hasContentRef: !!contentRef.current, hasNote: !!note, hasNoteId: note?.id });
    }
  }, [note, title, onSave, updateImageCount, calculateNoteSize, updateFormatState]);

  // Handle title changes (optimized - only save if title actually changed)
  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only trigger auto-save if title actually changed from original
    if (note && note.id && newTitle !== (note.title || '')) {
      console.log('Title changed from:', note.title, 'to:', newTitle);
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      setSaveStatus('pending');
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const currentContent = contentRef.current ? contentRef.current.innerHTML : '';
          await onSave(note.id, { title: newTitle, content: currentContent });
          setSaveStatus('success');
          console.log('Title save successful');
        } catch (error) {
          console.error('Error saving note:', error);
          setSaveStatus('error');
        }
        saveTimeoutRef.current = null;
      }, 1000); // Shorter timeout for title changes since they affect sidebar
    }
  }, [note, onSave]);

  // Handle clipboard paste (images and text)
  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || []);
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          insertImageFile(file);
        }
        break;
      }
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      insertImageFile(file);
    });
  }, []);

  // Insert image file at cursor position
  const insertImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      // Compress image before inserting
      compressImage(base64, (compressedBase64) => {
        insertImageAtCursor(compressedBase64);
      });
    };
    reader.readAsDataURL(file);
  };

  // Compress image to reduce payload size
  const compressImage = (base64, callback) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max width/height: 1200px)
      const maxSize = 1200;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress (0.8 quality for good balance)
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      callback(compressedBase64);
    };
    img.src = base64;
  };

  // Insert image at cursor position
  const insertImageAtCursor = (imageSrc) => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // If no selection, insert at end
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
    }

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.contentEditable = false;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.maxWidth = '400px';
    img.style.height = 'auto';
    img.style.borderRadius = '8px';
    img.style.cursor = 'pointer';
    img.draggable = false;
    
    // Add click handler for selection
    img.onclick = (e) => {
      e.stopPropagation();
      setSelectedImage(img);
      // Add visual selection indicator
      document.querySelectorAll('.image-container').forEach(container => {
        container.style.outline = 'none';
      });
      imageContainer.style.outline = '3px solid var(--accent-color)';
    };
    
    imageContainer.appendChild(img);
    
    // Insert image
    range.deleteContents();
    range.insertNode(imageContainer);
    
    // Add line break after image
    const br = document.createElement('br');
    range.collapse(false);
    range.insertNode(br);
    
    // Update content
    handleContentChange();
    updateFormatState();
  };

  // Handle image resize
  const handleImageResize = (width) => {
    if (selectedImage) {
      selectedImage.style.maxWidth = `${width}px`;
      handleContentChange();
    }
  };

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (contentRef.current && note && note.id) {
      const content = contentRef.current.innerHTML;
      
      // Clear any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      setSaveStatus('pending');
      try {
        await onSave(note.id, { title, content });
        setLastSavedContent(content); // Track manually saved content
        setSaveStatus('success');
      } catch (error) {
        console.error('Error saving note:', error);
        if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
          setSaveStatus('error');
          alert('Note is too large to save. Try reducing image sizes or removing some images.');
        } else {
          setSaveStatus('error');
        }
      }
    }
  }, [note, title, onSave]);

  // Handle image preset sizes
  const setImageSize = (size) => {
    if (!selectedImage) return;
    
    const sizes = {
      small: '200px',
      medium: '400px',
      large: '600px',
      full: '100%'
    };
    
    selectedImage.style.maxWidth = sizes[size];
    handleContentChange();
    updateFormatState();
  };

  const applyFormatting = useCallback((command, value = null) => {
    focusEditor();
    try {
      restoreSelection();
      document.execCommand(command, false, value);
      if (command === 'hiliteColor' && value) {
        // Fallback for browsers that only support backColor
        document.execCommand('backColor', false, value);
      }
      setTimeout(() => {
        handleContentChange();
        updateFormatState();
      }, 0);
    } catch (error) {
      console.error('Formatting command failed', command, error);
      if (command === 'hiliteColor' && value) {
        restoreSelection();
        document.execCommand('backColor', false, value);
      }
    }
  }, [focusEditor, handleContentChange, updateFormatState, restoreSelection]);

  const applyHeading = useCallback((value) => {
    focusEditor();
    restoreSelection();
    const block = value === 'p' ? 'P' : value.toUpperCase();
    document.execCommand('formatBlock', false, block);
    setTimeout(() => {
      handleContentChange();
      updateFormatState();
    }, 0);
  }, [focusEditor, handleContentChange, updateFormatState, restoreSelection]);

  const insertDivider = useCallback(() => {
    focusEditor();
    restoreSelection();
    document.execCommand('insertHorizontalRule');
    setTimeout(() => {
      handleContentChange();
      updateFormatState();
    }, 0);
  }, [focusEditor, handleContentChange, updateFormatState, restoreSelection]);

  const insertChecklistItem = useCallback(() => {
    focusEditor();
    restoreSelection();
    document.execCommand(
      'insertHTML',
      false,
      '<div class="note-checklist-item"><input type="checkbox"> <span>Checklist item</span></div><br>'
    );
    setTimeout(() => {
      handleContentChange();
      updateFormatState();
    }, 0);
  }, [focusEditor, handleContentChange, updateFormatState, restoreSelection]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Manual save with Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleManualSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      focusEditor();
      if (e.shiftKey) {
        document.execCommand('outdent');
      } else {
        document.execCommand('indent');
      }
      setTimeout(() => {
        handleContentChange();
        updateFormatState();
      }, 0);
      return;
    }
    
    // Delete note with Ctrl+Delete
    if (e.ctrlKey && e.key === 'Delete' && note && !selectedImage) {
      e.preventDefault();
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${note.title || 'Untitled'}"?\n\nThis action cannot be undone.`
      );
      if (confirmDelete) {
        deleteNote(note.id);
      }
      return;
    }
    
    // Delete selected image
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImage) {
      e.preventDefault();
      const container = selectedImage.closest('.image-container');
      if (container) {
        container.remove();
        setSelectedImage(null);
        handleContentChange();
        updateFormatState();
      }
    }
    
    // Enter key for line breaks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      setTimeout(() => {
        handleContentChange();
        updateFormatState();
      }, 0);
    }
  }, [selectedImage, handleContentChange, handleManualSave, note, deleteNote, focusEditor, updateFormatState]);

  // Click outside to deselect image
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.image-container')) {
        setSelectedImage(null);
        // Remove all selection outlines
        document.querySelectorAll('.image-container').forEach(container => {
          container.style.outline = 'none';
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!note) {
    if (loading) {
      return (
        <div className="empty-editor">
          <div className="loading-note">
            <div className="loading-spinner"></div>
            <p>Loading note...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="empty-editor">
        <p>Select a note to start editing</p>
        <div className="editor-help">
          <h4>🎨 Advanced Features</h4>
          <ul>
            <li>📋 Paste images from clipboard (Ctrl+V)</li>
            <li>🖱️ Drag & drop images from desktop</li>
            <li>📏 Click image → resize with handles or presets</li>
            <li>⌨️ Press Delete to remove selected image</li>
            <li>💾 Auto-saves as you type or Ctrl+S</li>
            <li>🗑️ Delete note with Ctrl+Delete</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-content">
        <div className="editor-header">
          <input
            type="text"
            className="note-title-input"
            placeholder="Enter note title..."
            value={title}
            onChange={handleTitleChange}
            onBlur={handleContentChange}
          />
          <button 
            className="save-button"
            onClick={handleManualSave}
            disabled={saveStatus === 'pending'}
            title="Save note (Ctrl+S)"
          >
            {saveStatus === 'pending' ? '⏳' : '💾'}
          </button>
          <div className={`note-size-indicator ${noteSize > 15000 ? 'large' : ''}`} title="Approximate note size">
            📏 {noteSize} KB {noteSize > 15000 ? '⚠️' : ''}
          </div>
        </div>

        <div className={`content-wrapper ${isDragging ? 'drag-active' : ''}`}>
          <div className="editor-toolbar" role="toolbar" aria-label="Formatting options">
            <div className="toolbar-group">
              <button
                type="button"
                className={`toolbar-button ${formatState.bold ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('bold')}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.italic ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('italic')}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.underline ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('underline')}
                title="Underline (Ctrl+U)"
              >
                U
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.strikeThrough ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('strikeThrough')}
                title="Strikethrough"
              >
                S
              </button>
            </div>

            <div className="toolbar-group heading-group">
              <select
                className="heading-select"
                value={formatState.heading}
                onChange={(e) => applyHeading(e.target.value)}
                onMouseDown={snapshotSelection}
                title="Text style"
              >
                <option value="p">Body</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Code</option>
              </select>
            </div>

            <div className="toolbar-group">
              <button
                type="button"
                className={`toolbar-button ${formatState.unorderedList ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('insertUnorderedList')}
                title="Bulleted list"
              >
                •
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.orderedList ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('insertOrderedList')}
                title="Numbered list"
              >
                1.
              </button>
              <button
                type="button"
                className="toolbar-button"
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={insertChecklistItem}
                title="Checklist"
              >
                ☑️
              </button>
            </div>

            <div className="toolbar-group">
              <button
                type="button"
                className={`toolbar-button ${formatState.align === 'left' ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('justifyLeft')}
                title="Align left"
              >
                L
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.align === 'center' ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('justifyCenter')}
                title="Align center"
              >
                C
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.align === 'right' ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('justifyRight')}
                title="Align right"
              >
                R
              </button>
              <button
                type="button"
                className={`toolbar-button ${formatState.align === 'justify' ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('justifyFull')}
                title="Justify"
              >
                J
              </button>
            </div>

            <div className="toolbar-group">
              <button
                type="button"
                className="toolbar-button"
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('hiliteColor', '#fff4a3')}
                title="Highlight"
              >
                HL
              </button>
              <button
                type="button"
                className="toolbar-button"
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={() => applyFormatting('removeFormat')}
                title="Clear formatting"
              >
                CLR
              </button>
              <button
                type="button"
                className="toolbar-button"
                onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); }}
                onClick={insertDivider}
                title="Insert divider"
              >
                —
              </button>
            </div>
          </div>

          <div
            ref={contentRef}
            className="note-content-editable"
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-placeholder="Start typing your note... 
📋 Paste images (Ctrl+V) or 🖱️ drag & drop from desktop!"
          />
          
          {isDragging && (
            <div className="drag-overlay">
              <div className="drag-indicator">
                <span>📁 Drop images here</span>
              </div>
            </div>
          )}
        </div>

        {/* Image resize controls */}
        {selectedImage && (
          <div className="image-resize-overlay">
            <div className="image-resize-controls">
              <div className="size-presets">
                <button onClick={() => setImageSize('small')}>Small</button>
                <button onClick={() => setImageSize('medium')}>Medium</button>
                <button onClick={() => setImageSize('large')}>Large</button>
                <button onClick={() => setImageSize('full')}>Full</button>
              </div>
              
              <div className="resize-handle-container">
                <input
                  type="range"
                  className="image-resize-slider"
                  min="100"
                  max="800"
                  value={parseInt(selectedImage.style.maxWidth) || 400}
                  onChange={(e) => handleImageResize(e.target.value)}
                />
                <span className="width-indicator">
                  {selectedImage.style.maxWidth || '400px'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="editor-footer">
          <span className="last-updated">
            Last updated: {new Date(note.updatedAt || Date.now()).toLocaleString()}
          </span>
          
          {imageCount > 0 && (
            <span className="image-count">
              📷 {imageCount} image{imageCount !== 1 ? 's' : ''}
            </span>
          )}
          
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === 'success' && '✅ Saved'}
            {saveStatus === 'pending' && '⏳ Saving...'}
            {saveStatus === 'error' && '❌ Save failed - try Ctrl+S'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;