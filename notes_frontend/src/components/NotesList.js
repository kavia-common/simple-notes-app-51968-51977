import React from 'react';
import NoteItem from './NoteItem';

// PUBLIC_INTERFACE
function NotesList({ notes, searchTerm, onEditNote, onDeleteNote }) {
  if (notes.length === 0 && searchTerm) {
    return (
      <div className="text-center mt-md text-secondary">
        <p>No notes found matching "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={() => onEditNote(note)}
          onDelete={() => onDeleteNote(note.id)}
        />
      ))}
    </div>
  );
}

export default NotesList;
