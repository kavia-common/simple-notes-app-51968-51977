// PUBLIC_INTERFACE
export function formatDate(timestamp) {
  /**
   * Formats a timestamp into a human-readable date string
   * @param {number} timestamp - The timestamp to format
   * @returns {string} - Formatted date string
   */
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Less than 1 minute ago
  if (diffMinutes < 1) {
    return 'Just now';
  }
  
  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  
  // Less than 24 hours ago
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  
  // Less than 7 days ago
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  // More than 7 days ago - show actual date
  const options = {
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}
