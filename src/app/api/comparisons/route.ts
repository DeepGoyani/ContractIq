import { NextResponse } from 'next/server';
import { compareDocuments } from '@/server/comparison/compare';

export async function POST(request: Request) {
  try {
    const { docAId, docBId } = await request.json();

    if (!docAId || !docBId) {
      return NextResponse.json({ error: 'docAId and docBId are required' }, { status: 400 });
    }

    const changes = await compareDocuments(docAId, docBId);

    return NextResponse.json({ changes });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 });
  }
}
