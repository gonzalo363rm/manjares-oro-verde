/** Alphabet without ambiguous chars (0/O, 1/I/L). */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;

/** Canonical code stored in DB / used in URLs (no prefix, no #). */
export function normalizeOrderCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/^MOV-?/, "");
}

/** Visual label: #ABC123 */
export function displayOrderCode(code: string): string {
  return `#${normalizeOrderCode(code)}`;
}

export function generateRawCode(length = CODE_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return result;
}
