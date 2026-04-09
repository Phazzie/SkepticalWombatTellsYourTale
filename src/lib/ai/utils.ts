/**
 * Strip control characters and non-printable chars from user-supplied content
 * before it is interpolated into AI prompts. Prevents prompt structure corruption
 * from adversarial or malformed input.
 */
export function sanitizeForPrompt(text: string): string {
  // Remove C0 control chars (0x00–0x08, 0x0B–0x0C, 0x0E–0x1F) and DEL (0x7F)
  // Preserve tab (0x09), LF (0x0A), CR (0x0D) which are valid in transcripts
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Hard-cap a string to maxChars to prevent silent token-limit failures
 * when long transcripts or document content are passed to OpenAI.
 */
export function truncateToTokenBudget(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n[...truncated for length]';
}
