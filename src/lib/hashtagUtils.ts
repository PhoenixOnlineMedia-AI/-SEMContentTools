// Utility function to format hashtags according to platform rules
export function formatHashtag(input: string): string {
  // Remove spaces and special characters, preserving numbers and accents
  const formatted = input
    // Convert to title case first (preserve existing capitals)
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1))
    // Remove special characters except accents and numbers
    .replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '')
    // Convert snake_case and kebab-case to camelCase
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase());

  return formatted;
}

// Format an array of hashtags
export function formatHashtags(hashtags: string[]): string[] {
  return hashtags.map(tag => {
    // Remove # if it exists at the start
    const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
    // Format and ensure # prefix
    return '#' + formatHashtag(cleanTag);
  });
}