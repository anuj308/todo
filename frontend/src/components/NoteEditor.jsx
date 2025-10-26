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
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
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

  const ensureTrailingParagraph = useCallback(() => {
    if (!contentRef.current) return;
    const root = contentRef.current;
    const last = root.lastElementChild;
    
    // Always ensure there's a trailing paragraph, even if empty
    const needsTrailing = !last || last.tagName !== 'P' || last.textContent.trim() !== '' || last.querySelector('*');
    
    if (needsTrailing) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      root.appendChild(p);
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
        ensureTrailingParagraph();
      }
    } else {
      setTitle('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
        setLastSavedContent('');
        setNoteSize(0);
        updateFormatState();
        ensureTrailingParagraph();
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
      ensureTrailingParagraph();
      
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
  }, [note, title, onSave, updateImageCount, calculateNoteSize, updateFormatState, ensureTrailingParagraph]);

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
    const checklistHTML = '<div class="note-checklist-item"><input type="checkbox"> <span contenteditable="true">Checklist item</span></div>';
    document.execCommand('insertHTML', false, checklistHTML);
    
    // Focus the newly inserted span
    setTimeout(() => {
      const allChecklists = contentRef.current?.querySelectorAll('.note-checklist-item span');
      const lastChecklist = allChecklists?.[allChecklists.length - 1];
      if (lastChecklist) {
        lastChecklist.focus();
        const range = document.createRange();
        range.selectNodeContents(lastChecklist);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
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

    // Zoom in/out/reset (Ctrl + '+', '-', '0')
    if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      setEditorFontSize((s) => Math.min(28, s + 2));
      return;
    }
    if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
      e.preventDefault();
      setEditorFontSize((s) => Math.max(10, s - 2));
      return;
    }
    if (e.ctrlKey && (e.key === '0' || e.key === ')')) {
      e.preventDefault();
      setEditorFontSize(14);
      return;
    }

    // Ctrl+Enter: exit current block (pre/blockquote/heading/list/checklist) into a new paragraph
    if (e.ctrlKey && e.key === 'Enter') {
      const sel = document.getSelection();
      const node = sel && sel.anchorNode;
      const getClosest = (n, selector) => {
        let el = n instanceof Element ? n : n?.parentElement;
        while (el && !el.matches(selector)) el = el.parentElement;
        return el || null;
      };
      const inQuote = node && getClosest(node, 'blockquote');
      const inPre = node && getClosest(node, 'pre');
      const inHeading = node && getClosest(node, 'h1,h2,h3,h4,h5,h6');
      const inList = node && getClosest(node, 'ul,ol');
      const inChecklist = node && getClosest(node, '.note-checklist-item');
      const block = inQuote || inPre || inHeading || inList || inChecklist;
      if (block) {
        e.preventDefault();
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        block.insertAdjacentElement('afterend', p);
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        setTimeout(() => {
          handleContentChange();
          updateFormatState();
          ensureTrailingParagraph();
        }, 0);
        return;
      }
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
    
    // Enter behaviors
    if (e.key === 'Enter' && !e.shiftKey) {
      const sel = document.getSelection();
      const node = sel && sel.anchorNode;
      const getClosest = (n, selector) => {
        let el = n instanceof Element ? n : n?.parentElement;
        while (el && !el.matches(selector)) el = el.parentElement;
        return el || null;
      };

      const inListItem = node && (getClosest(node, 'li') || getClosest(node, 'ul,ol'));
      const inChecklist = node && getClosest(node, '.note-checklist-item');
      const inQuote = node && getClosest(node, 'blockquote');
      const inPre = node && getClosest(node, 'pre');
      const inHeading = node && getClosest(node, 'h1,h2,h3,h4,h5,h6');

      // Checklist: insert a new checklist item below
      if (inChecklist) {
        e.preventDefault();
        const newItem = document.createElement('div');
        newItem.className = 'note-checklist-item';
        newItem.innerHTML = '<input type="checkbox"> <span contenteditable="true"></span>';
        inChecklist.insertAdjacentElement('afterend', newItem);
        // place caret inside new span
        const span = newItem.querySelector('span');
        span.focus();
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        setTimeout(() => {
          handleContentChange();
          updateFormatState();
        }, 0);
        return;
      }

      // In ordered/unordered list: let browser handle numbering/bullets
      if (inListItem) {
        return; // don't preventDefault
      }

      // In quote/code/heading: insert simple newline to stay in block
      if (inQuote || inPre || inHeading) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
        setTimeout(() => {
          handleContentChange();
          updateFormatState();
        }, 0);
        return;
      }

      // Default: insert paragraph break
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      setTimeout(() => {
        handleContentChange();
        updateFormatState();
        ensureTrailingParagraph();
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

              <div className="toolbar-group">
                <button
                  type="button"
                  className="toolbar-button"
                  onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); setEditorFontSize(s => Math.max(10, s - 2)); }}
                  title="Zoom out"
                >
                  −
                </button>
                <span className="zoom-indicator" aria-live="polite">{Math.round((editorFontSize/14)*100)}%</span>
                <button
                  type="button"
                  className="toolbar-button"
                  onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); setEditorFontSize(s => Math.min(28, s + 2)); }}
                  title="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  className="toolbar-button"
                  onMouseDown={(e) => { e.preventDefault(); snapshotSelection(); setEditorFontSize(14); }}
                  title="Reset zoom"
                >
                  100%
                </button>
              </div>

            <div className="toolbar-group">
              <button
                type="button"
                className="toolbar-button toolbar-help-button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                title="Keyboard shortcuts"
              >
                ❓
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
            style={{ fontSize: `${editorFontSize}px` }}
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

          {/* Keyboard shortcuts help popup */}
          {showShortcutsHelp && (
            <div className="shortcuts-help-overlay" onClick={() => setShowShortcutsHelp(false)}>
              <div className="shortcuts-help-panel" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-help-header">
                  <h3>⌨️ Keyboard Shortcuts</h3>
                  <button 
                    className="shortcuts-close-button"
                    onClick={() => setShowShortcutsHelp(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="shortcuts-help-content">
                  <div className="shortcuts-section">
                    <h4>📝 Formatting</h4>
                    <ul>
                      <li><kbd>Ctrl</kbd> + <kbd>B</kbd> — Bold</li>
                      <li><kbd>Ctrl</kbd> + <kbd>I</kbd> — Italic</li>
                      <li><kbd>Ctrl</kbd> + <kbd>U</kbd> — Underline</li>
                    </ul>
                  </div>
                  <div className="shortcuts-section">
                    <h4>🔢 Lists & Structure</h4>
                    <ul>
                      <li><kbd>Enter</kbd> — Continue in list/heading/code/quote</li>
                      <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> — Exit list/heading/code/quote</li>
                      <li><kbd>Tab</kbd> — Indent</li>
                      <li><kbd>Shift</kbd> + <kbd>Tab</kbd> — Outdent</li>
                    </ul>
                  </div>
                  <div className="shortcuts-section">
                    <h4>🔍 Zoom</h4>
                    <ul>
                      <li><kbd>Ctrl</kbd> + <kbd>+</kbd> — Zoom in</li>
                      <li><kbd>Ctrl</kbd> + <kbd>-</kbd> — Zoom out</li>
                      <li><kbd>Ctrl</kbd> + <kbd>0</kbd> — Reset zoom</li>
                    </ul>
                  </div>
                  <div className="shortcuts-section">
                    <h4>💾 File Operations</h4>
                    <ul>
                      <li><kbd>Ctrl</kbd> + <kbd>S</kbd> — Save note</li>
                      <li><kbd>Ctrl</kbd> + <kbd>Delete</kbd> — Delete note</li>
                    </ul>
                  </div>
                  <div className="shortcuts-section">
                    <h4>🖼️ Images</h4>
                    <ul>
                      <li><kbd>Ctrl</kbd> + <kbd>V</kbd> — Paste image</li>
                      <li><kbd>Delete</kbd> — Remove selected image</li>
                    </ul>
                  </div>
                </div>
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