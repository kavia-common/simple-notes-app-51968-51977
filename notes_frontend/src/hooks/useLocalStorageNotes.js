import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/generateId';

const STORAGE_KEY = 'simple_notes.v1';

// Helper function to get title from note body
const getTitle = (body) => {
  const lines = body.split('\n').filter(line => line.trim());
  return lines.length > 0 ? lines[0].trim() : 'Untitled';
};

// Helper function to create a note object
const createNoteObject = (body, existingNote = null) => {
  const now = Date.now();
  return {
    id: existingNote?.id || generateId(),
    title: getTitle(body),
    body: body.trim(),
    createdAt: existingNote?.createdAt || now,
    updatedAt: now
  };
};

// Demo/seed data
const createSeedData = () => [
  {
    id: generateId(),
    title: 'Welcome to Simple Notes',
    body: 'Welcome to Simple Notes\n\nThis is your first note! You can:\n• Click on any note to edit it\n• Use the "New Note" button to create more notes\n• Search through your notes using the search bar\n• Delete notes using the trash icon\n\nYour notes are automatically saved to your browser\'s local storage.',
    createdAt: Date.now() - 1000,
    updatedAt: Date.now() - 1000
  }
];

// PUBLIC_INTERFACE
export function useLocalStorageNotes() {
  const [notes, setNotes] = useState([]);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedNotes = JSON.parse(stored);
        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          // Handle invalid data
          setNotes(createSeedData());
        }
      } else {
        // First time - create seed data
        setNotes(createSeedData());
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      setNotes(createSeedData());
    }
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }, [notes]);

  const createNote = useCallback((body) => {
    if (!body.trim()) return;
    
    const newNote = createNoteObject(body);
    setNotes(prevNotes => [newNote, ...prevNotes]);
    return newNote;
  }, []);

  const updateNote = useCallback((id, body) => {
    if (!body.trim()) return;
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? createNoteObject(body, note)
          : note
      ).sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }, []);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote
  };
}
