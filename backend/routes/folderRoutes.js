import express from 'express';
import { 
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  reorderFolders,
  getFolderNotes,
  moveNoteToFolder
} from '../controllers/folderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Folder CRUD operations
router.get('/', getFolders);                    // GET /api/folders
router.post('/', createFolder);                 // POST /api/folders
router.get('/:id', getFolderById);             // GET /api/folders/:id
router.put('/:id', updateFolder);              // PUT /api/folders/:id
router.delete('/:id', deleteFolder);           // DELETE /api/folders/:id

// Folder management operations
router.put('/reorder', reorderFolders);        // PUT /api/folders/reorder
router.get('/:id/notes', getFolderNotes);      // GET /api/folders/:id/notes

// Note management within folders
router.put('/notes/:noteId/move', moveNoteToFolder); // PUT /api/folders/notes/:noteId/move

export default router;