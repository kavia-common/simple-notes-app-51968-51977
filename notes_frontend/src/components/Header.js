import React from 'react';

// PUBLIC_INTERFACE
function Header({ onCreateNote }) {
  return (
    <header className="flex items-center justify-between mb-lg">
      <h1 className="text-2xl font-semibold">Simple Notes</h1>
      <button 
        className="btn btn-primary"
        onClick={onCreateNote}
        aria-label="Create new note"
      >
        <span>+</span>
        New Note
      </button>
    </header>
  );
}

export default Header;
