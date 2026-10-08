/** @jest-environment node */
import { photoFormat } from '../profile-photo';

test('identifies supported photo bytes independently of MIME and extension', () => {
  expect(photoFormat(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]))?.extension).toBe('png');
  expect(photoFormat(new Uint8Array([255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0]))?.extension).toBe('jpg');
  expect(photoFormat(new TextEncoder().encode('RIFF0000WEBP0000'))?.extension).toBe('webp');
});

test('rejects SVG, HTML, PDFs and truncated uploads', () => {
  for (const value of ['<svg onload="alert(1)">', '<html>not a photo</html>', '%PDF-1.4 fake image', 'RIFF', '']) {
    expect(photoFormat(new TextEncoder().encode(value))).toBeNull();
  }
});
