import { Routes, Route, NavLink } from 'react-router-dom';
import { TodoProvider } from './context/TodoContext';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import NotesPage from './components/NotesPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Multi-App</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? "active-link" : ""}>
            Todos
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => isActive ? "active-link" : ""}>
            Notes
          </NavLink>
        </nav>
      </header>
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={
              <TodoProvider>
                <div className="todo-container">
                  <TodoForm />
                  <TodoList />
                </div>
              </TodoProvider>
            } />
            <Route path="/notes" element={<NotesPage />} />
          </Routes>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Multi-App</p>
      </footer>
    </div>
  );
}

export default App;
