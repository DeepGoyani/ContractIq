import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { processDocument } from '@/server/documents/processDocument';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds the 50 MB limit.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storageKey = `${uuidv4()}-${file.name}`;
    const storagePath = join(process.cwd(), 'storage', storageKey);
    await writeFile(storagePath, buffer);

    const document = await prisma.document.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storageKey,
        status: 'PROCESSING',
      },
    });

    // Start background processing
    processDocument(document.id).catch(console.error);

    return NextResponse.json({
      documentId: document.id,
      status: 'PROCESSING',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
