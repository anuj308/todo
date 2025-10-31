import api from './api';

// Normalize note object (convert _id to id if needed)
const normalizeNote = (note) => {
  if (!note) return null;
  if (note.id) return note;
  if (note._id) {
    return {
      ...note,
      id: note._id,
    };
  }
  return note;
};

// Normalize array of notes
const normalizeNotes = (notes) => {
  if (!Array.isArray(notes)) return [];
  return notes.map(normalizeNote).filter(note => note && (note.id || note._id));
};

// Fetch notes list (titles and metadata only, no content)
export const getNotesList = async () => {
  try {
    const response = await api.get('/notes/list');
    return normalizeNotes(response.data);
  } catch (error) {
    throw error;
  }
};

// Fetch full note by ID (includes content)
export const getNoteById = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return normalizeNote(response.data);
  } catch (error) {
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return normalizeNote(response.data);
  } catch (error) {
    throw error;
  }
};

// Update a note
export const updateNote = async (noteId, updates) => {
  try {
    const response = await api.put(`/notes/${noteId}`, updates);
    return normalizeNote(response.data);
  } catch (error) {
    throw error;
  }
};

// Delete a note
export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search notes
export const searchNotes = async (query) => {
  try {
    const response = await api.get(`/notes/search?query=${encodeURIComponent(query)}`);
    return normalizeNotes(response.data);
  } catch (error) {
    throw error;
  }
};

// Move note to different folder
export const moveNoteToFolder = async (noteId, folderId) => {
  try {
    const response = await api.patch(`/notes/${noteId}/move`, { folderId });
    return normalizeNote(response.data);
  } catch (error) {
    throw error;
  }
};

// Reorder notes
export const reorderNotes = async (noteId, newOrder) => {
  try {
    const response = await api.patch(`/notes/${noteId}/reorder`, { order: newOrder });
    return normalizeNote(response.data);
  } catch (error) {
    throw error;
  }
};
