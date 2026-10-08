export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/** Inspect bytes rather than trusting the uploaded filename or MIME type. */
export function photoFormat(bytes: Uint8Array): { extension: string; contentType: string } | null {
  if (bytes.length < 12) return null;
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) {
    return { extension: 'png', contentType: 'image/png' };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: 'jpg', contentType: 'image/jpeg' };
  }
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
    return { extension: 'webp', contentType: 'image/webp' };
  }
  return null;
}
