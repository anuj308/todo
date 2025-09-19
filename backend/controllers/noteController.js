import Note from '../models/noteModel.js';
import Folder from '../models/folderModel.js';

// Get all notes for a user
export const getNotes = async (req, res) => {
  try {
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    const { folderId, includeUnfoldered = false } = req.query;
    
    let query = { userId };
    
    if (folderId) {
      query.folderId = folderId;
    } else if (includeUnfoldered === 'true') {
      query.$or = [
        { folderId: null },
        { folderId: { $exists: false } }
      ];
    }
    
    const notes = await Note.find(query)
      .populate('folder', 'name color icon')
      .sort({ isPinned: -1, updatedAt: -1 })
      .select('id title content createdAt updatedAt folderId isPinned order tags');
    
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific note
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const { title, content = '', folderId, tags = [] } = req.body;
    
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // If folderId is provided, verify it belongs to the user
    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(400).json({ message: 'Invalid folder' });
      }
    }
    
    const newNote = await Note.create({
      title,
      content,
      folderId: folderId || null,
      tags,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Populate folder information before sending response
    await newNote.populate('folder', 'name color icon');
    
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    // Make sure updatedAt is updated
    updates.updatedAt = new Date();
    
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, userId },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    const note = await Note.findOneAndDelete({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search notes
export const searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const notes = await Note.find(
      { 
        userId,
        $text: { $search: query } 
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .select('id title content createdAt updatedAt');
    
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};