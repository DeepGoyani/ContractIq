import prisma from '@/lib/prisma';

export function normalizeTextWithMapping(original: string) {
  let text = '';
  const indexMap: number[] = [];
  
  for (let i = 0; i < original.length; i++) {
    const char = original[i];
    
    if (/\s/.test(char)) {
      if (text.length > 0 && text[text.length - 1] !== ' ') {
        text += ' ';
        indexMap.push(i);
      }
    } else {
      text += char.toLowerCase();
      indexMap.push(i);
    }
  }
  
  return {
    text,
    indexMap
  };
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').toLowerCase().trim();
}

export interface CitationVerification {
  verified: boolean;
  documentId: string;
  quote: string;
  originalStart?: number;
  originalEnd?: number;
  pageStart?: number;
  pageEnd?: number;
}

export async function verifyCitation(documentId: string, quote: string): Promise<CitationVerification> {
  const normalizedQuote = normalizeText(quote);
  
  if (!normalizedQuote) {
    return { verified: false, documentId, quote };
  }

  const chunks = await prisma.chunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: 'asc' }
  });

  for (const chunk of chunks) {
    const { text: normalizedChunk, indexMap } = normalizeTextWithMapping(chunk.text);
    
    const startIndex = normalizedChunk.indexOf(normalizedQuote);
    if (startIndex !== -1) {
      const originalStart = indexMap[startIndex];
      const originalEnd = indexMap[startIndex + normalizedQuote.length - 1] + 1; 
      
      return {
        verified: true,
        documentId,
        quote,
        originalStart: chunk.startOffset + originalStart,
        originalEnd: chunk.startOffset + originalEnd,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
      };
    }
  }

  return { verified: false, documentId, quote };
}
