import React from 'react';

// PUBLIC_INTERFACE
function EmptyState({ onCreateNote }) {
  return (
    <div className="text-center mt-md">
      <div className="card">
        <div className="card-content">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
            📝
          </div>
          <h2 className="text-xl font-medium mb-md">No notes yet</h2>
          <p className="text-secondary mb-lg">
            Start capturing your thoughts and ideas by creating your first note.
          </p>
          <button 
            className="btn btn-primary"
            onClick={onCreateNote}
          >
            <span>+</span>
            Create your first note
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
