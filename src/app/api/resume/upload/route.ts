
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob'; // New import for Vercel Blob

const prisma = new PrismaClient();

export const config = {
  runtime: 'edge', // Recommended for Vercel Blob for better performance
};

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Generate a unique file name to prevent collisions
    const filename = `${Date.now()}-${file.name}`;

    // Upload file to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public', // Make the file publicly accessible
    });

    const resumeUrl = blob.url; // Vercel Blob returns the public URL

    await prisma.personalData.updateMany({
      data: {
        resumeUrl,
      },
    });

    return NextResponse.json({ resumeUrl });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
