import { NextResponse } from 'next/server';
import { verifyCitation } from '@/server/citations/verify';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { documentId, quote, messageId } = await request.json();

    if (!documentId || !quote) {
      return NextResponse.json({ error: 'documentId and quote are required' }, { status: 400 });
    }

    const verification = await verifyCitation(documentId, quote);

    // If a messageId is provided and the quote is verified, persist it.
    if (messageId && verification.verified) {
      await prisma.citation.create({
        data: {
          messageId,
          documentId,
          quote: quote,
          normalizedQuote: quote.replace(/\s+/g, ' ').toLowerCase().trim(),
          verified: true,
          pageStart: verification.pageStart,
          pageEnd: verification.pageEnd,
          startOffset: verification.originalStart,
          endOffset: verification.originalEnd,
          confidence: 1.0,
        }
      });
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
