import { NotesProvider, useNotes } from '../context/NotesContext';
import { useFolders } from '../context/FoldersContext';
import FolderSidebar from './FolderSidebar';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import './NotesPage.css';

function NotesPageContent() {
  const { activeNote, updateNote, noteLoading } = useNotes();

  return (
    <div className="notes-page">
      <FolderSidebar />
      <div className="notes-main-content">
        <NotesList />
        <NoteEditor note={activeNote} onSave={updateNote} loading={noteLoading} />
      </div>
    </div>
  );
}

function NotesPage() {
  return (
    <NotesProvider>
      <NotesPageContent />
    </NotesProvider>
  );
}

export default NotesPage;