import Folder from '../models/folderModel.js';
import Note from '../models/noteModel.js';

// Get all folders for a user
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const folders = await Folder.find({ userId })
      .sort({ order: 1, createdAt: 1 })
      .populate('notesCount');
    
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific folder with its notes
export const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const folder = await Folder.findOne({ _id: id, userId });
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Get notes in this folder
    const notes = await Note.find({ folderId: id, userId })
      .sort({ isPinned: -1, order: 1, updatedAt: -1 })
      .select('id title content createdAt updatedAt isPinned order tags');
    
    res.status(200).json({
      folder,
      notes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const { name, color = '#3b82f6', icon = '📁' } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }
    
    // Check if folder name already exists for this user
    const existingFolder = await Folder.findOne({ name, userId });
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }
    
    // Get the highest order number for this user
    const highestOrderFolder = await Folder.findOne({ userId })
      .sort({ order: -1 })
      .select('order');
    
    const nextOrder = highestOrderFolder ? highestOrderFolder.order + 1 : 0;
    
    const newFolder = await Folder.create({
      name,
      color,
      icon,
      order: nextOrder,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a folder
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    
    // Don't allow updating userId
    delete updates.userId;
    
    // If name is being updated, check for duplicates
    if (updates.name) {
      const existingFolder = await Folder.findOne({ 
        name: updates.name, 
        userId,
        _id: { $ne: id }
      });
      if (existingFolder) {
        return res.status(400).json({ message: 'Folder with this name already exists' });
      }
    }
    
    updates.updatedAt = new Date();
    
    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { moveNotesToFolderId } = req.body;
    const userId = req.user.id;
    
    const folder = await Folder.findOne({ _id: id, userId });
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Check if it's a default folder
    if (folder.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default folder' });
    }
    
    // Handle notes in this folder
    const notesInFolder = await Note.find({ folderId: id, userId });
    
    if (notesInFolder.length > 0) {
      if (moveNotesToFolderId) {
        // Move notes to specified folder
        const targetFolder = await Folder.findOne({ 
          _id: moveNotesToFolderId, 
          userId 
        });
        
        if (!targetFolder) {
          return res.status(400).json({ 
            message: 'Target folder not found' 
          });
        }
        
        await Note.updateMany(
          { folderId: id, userId },
          { folderId: moveNotesToFolderId }
        );
      } else {
        // Move notes to default folder
        const defaultFolder = await Folder.findOne({ 
          userId, 
          isDefault: true 
        });
        
        if (defaultFolder) {
          await Note.updateMany(
            { folderId: id, userId },
            { folderId: defaultFolder._id }
          );
        } else {
          // If no default folder, set folderId to null
          await Note.updateMany(
            { folderId: id, userId },
            { $unset: { folderId: 1 } }
          );
        }
      }
    }
    
    await Folder.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reorder folders
export const reorderFolders = async (req, res) => {
  try {
    const { folderIds } = req.body;
    const userId = req.user.id;
    
    if (!Array.isArray(folderIds)) {
      return res.status(400).json({ message: 'folderIds must be an array' });
    }
    
    // Update the order of each folder
    const updatePromises = folderIds.map((folderId, index) => 
      Folder.findOneAndUpdate(
        { _id: folderId, userId },
        { order: index },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Return updated folders
    const folders = await Folder.find({ userId })
      .sort({ order: 1 })
      .populate('notesCount');
    
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notes in a specific folder
export const getFolderNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20, search } = req.query;
    
    // Verify folder belongs to user
    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Build query
    let query = { folderId: id, userId };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    // Get notes with pagination
    const notes = await Note.find(query)
      .sort({ isPinned: -1, order: 1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('id title content createdAt updatedAt isPinned order tags');
    
    const total = await Note.countDocuments(query);
    
    res.status(200).json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Move note to folder
export const moveNoteToFolder = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { folderId } = req.body;
    const userId = req.user.id;
    
    // Verify note belongs to user
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Verify folder belongs to user (if folderId is provided)
    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }
    
    // Update note's folder
    note.folderId = folderId || null;
    await note.save();
    
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};