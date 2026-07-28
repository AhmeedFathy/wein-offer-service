// Shared @mention parsing for team chat and record-discussion.
//
// Lives at the features/ root as .mjs (not src/shared/, which is TypeScript
// imported only by the Vite-bundled main.ts) because both consumers are .mjs
// modules loaded directly by `node --test`, which cannot import .ts.
//
// Names are matched against a supplied people list rather than a generic
// @handle pattern, because profiles have no handle column -- only full_name.

const BOUNDARY_BEFORE = /[\s\p{P}]/u;
const BOUNDARY_AFTER = /[\s\p{P}]/u;

function isBoundaryBefore(text, index) {
  if (index === 0) return true;
  return BOUNDARY_BEFORE.test(text[index - 1]);
}

function isBoundaryAfter(text, index) {
  if (index >= text.length) return true;
  return BOUNDARY_AFTER.test(text[index]);
}

/**
 * Parse @mentions out of body text against a list of candidate people.
 *
 * Matching is case-insensitive and longest-name-first, so a person named
 * "Ali" does not falsely match inside "@Alice Smith". A match is only
 * accepted when the "@" starts a token and the name ends on a boundary.
 *
 * @param {string} text
 * @param {Array<{id: string, full_name?: string}>} people
 * @returns {string[]} deduped user ids, in first-appearance order
 */
export function parseMentions(text = "", people = []) {
  const source = String(text ?? "");
  if (!source.includes("@")) return [];

  const candidates = people
    .filter((person) => person && person.id && person.full_name)
    .map((person) => ({ id: person.id, name: String(person.full_name) }))
    .sort((a, b) => b.name.length - a.name.length);
  if (!candidates.length) return [];

  const lowered = source.toLowerCase();
  const found = [];
  const seen = new Set();

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== "@" || !isBoundaryBefore(source, index)) continue;
    const nameStart = index + 1;
    for (const candidate of candidates) {
      const nameEnd = nameStart + candidate.name.length;
      if (lowered.startsWith(candidate.name.toLowerCase(), nameStart) && isBoundaryAfter(source, nameEnd)) {
        if (!seen.has(candidate.id)) {
          seen.add(candidate.id);
          found.push(candidate.id);
        }
        // Skip past the matched name so an "@" inside it can't re-trigger.
        index = nameEnd - 1;
        break;
      }
    }
  }

  return found;
}

/**
 * The names (not ids) that were actually mentioned, longest-first. Used by
 * renderers that need to highlight the matched spans in displayed text.
 *
 * @param {string} text
 * @param {Array<{id: string, full_name?: string}>} people
 * @returns {string[]}
 */
export function mentionedNames(text = "", people = []) {
  const ids = new Set(parseMentions(text, people));
  return people
    .filter((person) => person && ids.has(person.id) && person.full_name)
    .map((person) => String(person.full_name))
    .sort((a, b) => b.length - a.length);
}

/**
 * Detect an in-progress "@..." token at the caret, for composer typeahead.
 * Returns null when the caret is not inside a mention token.
 *
 * Allows spaces so multi-word full names can be typed, but stops at the
 * first character that cannot begin a name and caps the token length so a
 * stray "@" doesn't swallow the rest of a long message.
 *
 * @param {string} text
 * @param {number} caret
 * @returns {{ query: string, start: number } | null}
 */
export function activeMentionToken(text = "", caret = 0) {
  const source = String(text ?? "");
  const position = Math.max(0, Math.min(Number(caret) || 0, source.length));
  const MAX_TOKEN = 40;

  for (let index = position - 1; index >= 0 && position - index <= MAX_TOKEN; index -= 1) {
    const char = source[index];
    if (char === "@") {
      if (!isBoundaryBefore(source, index)) return null;
      return { query: source.slice(index + 1, position), start: index };
    }
    if (char === "\n") return null;
  }
  return null;
}
