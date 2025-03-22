// client/src/components/TodoItem.jsx
import { useContext } from 'react';
import { TodoContext } from '../context/TodoContext';
import { FaTrash, FaCheck, FaRegCircle } from 'react-icons/fa';

function TodoItem({ todo }) {
  const { toggleTodo, deleteTodo } = useContext(TodoContext);

  return (
    <div className="todo-item">
      <div className="todo-content">
        <button
          className={`todo-check ${todo.completed ? 'completed' : ''}`}
          onClick={() => toggleTodo(todo._id, !todo.completed)}
        >
          {todo.completed ? <FaCheck /> : <FaRegCircle />}
        </button>
        <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
      </div>
      <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>
        <FaTrash />
      </button>
    </div>
  );
}

export default TodoItem;