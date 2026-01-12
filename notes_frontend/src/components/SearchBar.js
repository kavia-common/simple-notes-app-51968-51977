import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
function SearchBar({ onSearch }) {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <div className="mb-lg" style={{ position: 'relative' }}>
      <input
        type="text"
        className="input"
        placeholder="Search notes..."
        value={searchValue}
        onChange={handleChange}
        aria-label="Search notes"
      />
      {searchValue && (
        <button
          className="btn btn-secondary btn-icon"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '4px'
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;
