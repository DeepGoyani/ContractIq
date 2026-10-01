import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface SearchOptions {
  query: string;
  documentIds: string[];
  limit?: number;
}

export async function searchDocumentChunks(options: SearchOptions) {
  const { query, documentIds, limit = 8 } = options;

  if (documentIds.length === 0 || !query.trim()) {
    return [];
  }

  try {
    const formattedQuery = query.trim().split(/\s+/).join(' | ');

    const chunks = await prisma.$queryRaw<any[]>`
      SELECT id, "documentId", "pageStart", "pageEnd", "chunkIndex", section, text, "startOffset", "endOffset"
      FROM "Chunk"
      WHERE "documentId" IN (${Prisma.join(documentIds)})
        AND to_tsvector('english', text) @@ to_tsquery('english', ${formattedQuery})
      LIMIT ${limit}
    `;

    return chunks.map(chunk => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      text: chunk.text,
      score: 1.0 // Placeholder score for text search match
    }));
  } catch (error) {
    console.warn("Full text search failed, falling back to contains", error);
    
    // Fallback for environments where tsvector might fail or syntax differs slightly
    const chunks = await prisma.chunk.findMany({
      where: {
        documentId: { in: documentIds },
        text: { contains: query, mode: 'insensitive' }
      },
      take: limit
    });
    
    return chunks.map(chunk => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      text: chunk.text,
      score: 1.0
    }));
  }
}
