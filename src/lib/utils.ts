/**
 * Generate a URL-friendly slug from an event name.
 * Appends a short random suffix to ensure uniqueness.
 * @param name - Event name to slugify
 * @returns URL-safe slug string
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Calculate the "since" cutoff for post time windowing.
 * Returns a date 2 hours ago, used when there are enough posts.
 */
export function getTimeWindowCutoff(): Date {
  return new Date(Date.now() - 2 * 60 * 60 * 1000);
}

/**
 * Determine tile size class based on post ID for visual variety.
 * Uses deterministic hash to keep layout stable across re-renders.
 * @param postId - Post ID to hash
 * @returns CSS class for grid span
 */
export function getTileSize(postId: string): "normal" | "large" {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash << 5) - hash + postId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 5 === 0 ? "large" : "normal";
}
