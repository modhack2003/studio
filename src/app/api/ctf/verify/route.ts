import { NextRequest, NextResponse } from 'next/server';

// Puzzles with server-side solutions (never exposed to client)
const PUZZLES = [
  { level: 1, solution: "admin" },
  { level: 2, solution: "admin" },
  { level: 3, solution: "admin" },
  { level: 4, solution: "admin" },
  { level: 5, solution: "admin" },
];

// Rate limiting for puzzle attempts
const puzzleAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_PUZZLE_ATTEMPTS = 20; // per minute
const WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();

    // Rate limiting
    const entry = puzzleAttempts.get(clientIP);
    if (entry && now < entry.resetTime) {
      if (entry.count >= MAX_PUZZLE_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many attempts. Please wait.' },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      puzzleAttempts.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    }

    const { level, answer } = await request.json();

    if (typeof level !== 'number' || level < 1 || level > PUZZLES.length) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    if (typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
    }

    const puzzle = PUZZLES[level - 1];
    const isCorrect = answer.toLowerCase().trim() === puzzle.solution;

    return NextResponse.json({
      correct: isCorrect,
      isLastLevel: level === PUZZLES.length,
    });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
