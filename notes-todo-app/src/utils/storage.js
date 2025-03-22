export const loadNotes = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const notes = localStorage.getItem('notes');
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

export const saveNotes = (notes) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('notes', JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
};

export const loadTodos = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos) : [];
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
};

export const saveTodos = (todos) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};