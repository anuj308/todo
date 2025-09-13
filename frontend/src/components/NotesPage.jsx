import { NotesProvider } from '../context/NotesContext';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';

function NotesPage() {
  return (
    <NotesProvider>
      <div className="notes-container">
        <NotesList />
        <NoteEditor />
      </div>
    </NotesProvider>
  );
}

export default NotesPage;