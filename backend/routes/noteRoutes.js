import express from 'express';
import { 
  getNotes, 
  getNotesList,
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote,
  searchNotes
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
// Get note list (titles and metadata only, no content)
router.get('/list', protect, getNotesList);

// Get all notes (with content - for backward compatibility)
router.get('/', protect, getNotes);

// Search notes
router.get('/search', protect, searchNotes);

// Get a specific note
router.get('/:id', protect, getNoteById);

// Create a new note
router.post('/', protect, createNote);

// Update a note
router.put('/:id', protect, updateNote);

// Delete a note
router.delete('/:id', protect, deleteNote);

export default router;