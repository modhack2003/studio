export const SHADOW_TRACKS = {
  cipher: {
    title: 'Shadow protocol', subtitle: 'Five locks. One signal. Follow the trail.',
    puzzles: [
      { title: 'ROT13', description: 'Recover the callsign from this intercepted message.', cipher: 'funqbj', hint: 'Rotate each letter by 13 positions.' },
      { title: 'Base64', description: 'Decode the transport payload.', cipher: 'Y3Jvdw==', hint: 'Base64 encodes bytes as printable text. It is not encryption.' },
      { title: 'Hex dump', description: 'Read the ASCII bytes recovered from memory.', cipher: '67656e6a75747375', hint: 'Split into pairs. Each hexadecimal byte maps to one character.' },
      { title: 'Caesar +3', description: 'Undo the three-position alphabet shift.', cipher: 'flskhu', hint: 'Move each letter three positions backward.' },
      { title: 'Binary signal', description: 'Reassemble the final plaintext.', cipher: '01100101 01110011 01100011 01100001 01110000 01100101', hint: 'Each group is an 8-bit ASCII character.' },
    ],
  },
  archive: {
    title: 'Archive recovery', subtitle: 'The backup is locked. Read what was left behind.',
    puzzles: [
      { title: 'Escaped path', description: 'Decode the percent-encoded directory name.', cipher: '%76%61%75%6c%74', hint: 'Each %xx represents one hexadecimal byte.' },
      { title: 'Mirror file', description: 'A damaged log was written in reverse. Restore it.', cipher: 'evihcra', hint: 'Read from right to left.' },
      { title: 'Nested transport', description: 'Decode Base64, then decode the resulting hexadecimal text.', cipher: 'NjU2MzY4NmY=', hint: 'There are two layers. The intermediate result contains hex pairs.' },
    ],
  },
  signal: {
    title: 'Root signal', subtitle: 'A quiet channel is still a channel.',
    puzzles: [
      { title: 'Morse transmission', description: 'Decode the intercepted word.', cipher: '.-. --- --- -', hint: 'Spaces separate letters. Dot-dash-dot is R.' },
      { title: 'Decimal memory', description: 'Convert the decimal ASCII bytes to text.', cipher: '115 112 101 99 116 114 101', hint: '115 is the lowercase letter s.' },
      { title: 'Alphabet mirror', description: 'Decode the Atbash message.', cipher: 'gizro', hint: 'A maps to Z, B to Y. Mirror the alphabet.' },
    ],
  },
} as const;

export type ShadowTrack = keyof typeof SHADOW_TRACKS;

export const DECOY_PATHS = ['/admin', '/administrator', '/wp-admin', '/cpanel', '/admin/login', '/dashboard/login', '/b1kr4m-5h4d0w', '/admin/access', '/admin/backup', '/root'] as const;
