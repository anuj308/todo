import { NotesProvider } from '../context/NotesContext';
import { useFolders } from '../context/FoldersContext';
import FolderSidebar from './FolderSidebar';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import './NotesPage.css';

function NotesPage() {
  return (
    <NotesProvider>
      <div className="notes-page">
        <FolderSidebar />
        <div className="notes-main-content">
          <NotesList />
          <NoteEditor />
        </div>
      </div>
    </NotesProvider>
  );
}

export default NotesPage;