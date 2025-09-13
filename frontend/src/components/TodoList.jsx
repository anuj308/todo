// client/src/components/TodoList.jsx
import { useContext } from 'react';
import { TodoContext } from '../context/TodoContext';
import TodoItem from './TodoItem';

function TodoList() {
  const { todos, isLoading, error } = useContext(TodoContext);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Ensure todos is an array before mapping
  const todoList = Array.isArray(todos) ? todos : [];

  return (
    <div className="todo-list">
      {todoList.length === 0 ? (
        <p className="empty-list">No tasks yet. Add your first task above!</p>
      ) : (
        todoList.map((todo) => <TodoItem key={todo._id} todo={todo} />)
      )}
    </div>
  );
}

export default TodoList;