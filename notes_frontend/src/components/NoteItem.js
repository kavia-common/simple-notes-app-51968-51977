import React from 'react';
import { formatDate } from '../utils/formatDate';

// PUBLIC_INTERFACE
function NoteItem({ note, onEdit, onDelete }) {
  const handleClick = () => {
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  // Get snippet from body (second line or first 100 chars)
  const getSnippet = (body, title) => {
    const lines = body.split('\n').filter(line => line.trim());
    if (lines.length > 1) {
      return lines[1];
    }
    // If only one line, use part of it (excluding the title)
    const remainingText = body.replace(title, '').trim();
    return remainingText.substring(0, 100) + (remainingText.length > 100 ? '...' : '');
  };

  const snippet = getSnippet(note.body, note.title);

  return (
    <div 
      className="card cursor-pointer"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-content">
        <div className="flex justify-between items-start gap-md">
          <div className="flex-1" style={{ minWidth: 0 }}>
            <h3 className="font-medium mb-sm" style={{ margin: 0, wordBreak: 'break-word' }}>
              {note.title}
            </h3>
            {snippet && (
              <p className="text-sm text-secondary mb-sm" style={{ margin: 0, wordBreak: 'break-word' }}>
                {snippet}
              </p>
            )}
            <p className="text-sm text-secondary" style={{ margin: 0 }}>
              {formatDate(note.updatedAt)}
            </p>
          </div>
          <button
            className="btn btn-danger btn-icon"
            onClick={handleDelete}
            aria-label="Delete note"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteItem;
