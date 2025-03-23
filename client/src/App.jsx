import { TodoProvider } from './context/TodoContext';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="app">
        <header>
          <h1>Todo App</h1>
        </header>
        <main>
          <div className="container">
            <TodoForm />
            <TodoList />
          </div>
        </main>
        <footer>
          <p>&copy; {new Date().getFullYear()} Todo App</p>
        </footer>
      </div>
    </TodoProvider>
  );
}

export default App;
