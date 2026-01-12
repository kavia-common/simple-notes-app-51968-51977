import React, { useState, useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
function NoteEditor({ note, isCreating, onSave, onCancel }) {
  const [body, setBody] = useState(note ? note.body : '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setBody(note ? note.body : '');
  }, [note]);

  const handleSave = () => {
    if (!body.trim()) {
      return;
    }
    onSave({ body: body.trim() });
  };

  const handleCancel = () => {
    // Only cancel if it's a new empty note
    if (isCreating && !body.trim()) {
      onCancel();
      return;
    }
    
    // For existing notes or new notes with content, ask for confirmation
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Esc to cancel (only for empty new notes)
    if (e.key === 'Escape' && isCreating && !body.trim()) {
      handleCancel();
    }
  };

  const title = isCreating ? 'Create New Note' : 'Edit Note';

  return (
    <div className="card mb-lg">
      <div className="card-content">
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-lg font-semibold" style={{ margin: 0 }}>
            {title}
          </h2>
          <div className="flex gap-sm">
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!body.trim()}
            >
              Save
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          className="input textarea"
          placeholder="Start typing your note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={8}
          aria-label="Note content"
        />
        
        <div className="text-sm text-secondary mt-md">
          <p style={{ margin: 0 }}>
            Press Cmd/Ctrl+S to save
            {isCreating && ' • Press Esc to cancel (when empty)'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
