import React, { useState, useCallback } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import EmptyState from './EmptyState';
import { useLocalStorageNotes } from '../hooks/useLocalStorageNotes';
import { debounce } from '../utils/debounce';

// PUBLIC_INTERFACE
function NotesApp() {
  const { notes, createNote, updateNote, deleteNote } = useLocalStorageNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Debounced search to improve performance
  const debouncedSetSearchTerm = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearch = (term) => {
    debouncedSetSearchTerm(term);
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.body.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleSaveNote = (noteData) => {
    if (isCreating) {
      createNote(noteData.body);
    } else if (editingNote) {
      updateNote(editingNote.id, noteData.body);
    }
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      // Close editor if we're editing the deleted note
      if (editingNote && editingNote.id === noteId) {
        setEditingNote(null);
      }
    }
  };

  const isEditing = isCreating || editingNote !== null;

  return (
    <div className="container">
      <Header onCreateNote={handleCreateNote} />
      
      {!isEditing && (
        <SearchBar onSearch={handleSearch} />
      )}
      
      {isEditing && (
        <NoteEditor
          note={editingNote}
          isCreating={isCreating}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      )}
      
      {!isEditing && notes.length === 0 && (
        <EmptyState onCreateNote={handleCreateNote} />
      )}
      
      {!isEditing && notes.length > 0 && (
        <NotesList
          notes={filteredNotes}
          searchTerm={searchTerm}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
    </div>
  );
}

export default NotesApp;
