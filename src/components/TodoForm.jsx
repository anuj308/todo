// client/src/components/TodoForm.jsx
import { useState, useContext } from 'react';
import { TodoContext } from '../context/TodoContext';

function TodoForm() {
  const [text, setText] = useState('');
  const { addTodo } = useContext(TodoContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      await addTodo(text);
      setText('');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a new task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default TodoForm;