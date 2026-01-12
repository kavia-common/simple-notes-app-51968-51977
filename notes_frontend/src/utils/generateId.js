// PUBLIC_INTERFACE
export function generateId() {
  /**
   * Generates a unique ID using timestamp and random string
   * Format: timestamp-randomstring
   */
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}`;
}
