export function uuidToJamCode(uuid: string): string {
  // Remove hyphens and take first 8 characters
  const hex = uuid.replace(/-/g, '').substring(0, 8);
  
  // Convert to number and ensure 4-digit range (1000-9999)
  const num = parseInt(hex, 16);
  const code = (num % 9000) + 1000;
  
  return code.toString();
}

/**
 * Convert 4-digit code back to UUID
 * This is the reverse lookup - needs your UUID list
 */
export function jamCodeToUuid(code: string, uuidList: string[]): string | null {
  // Check each UUID to see if it generates this code
  for (const uuid of uuidList) {
    if (uuidToJamCode(uuid) === code) {
      return uuid;
    }
  }
  return null;
}

/**
 * Validate jam code format
 */
export function isValidJamCode(code: string): boolean {
  return /^\d{4}$/.test(code) && parseInt(code) >= 1000 && parseInt(code) <= 9999;
}

/**
 * Generate shareable jam URL
 */
export function generateJamUrl(uuid: string): string {
  return `${window.location.origin}/creator/${uuid}`;
}
