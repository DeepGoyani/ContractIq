import prisma from '@/lib/prisma';
import { join } from 'path';
import { extractDocumentText } from './extraction';
import { chunkDocument } from './chunking';

export async function processDocument(documentId: string) {
  try {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error('Document not found');

    const filePath = join(process.cwd(), 'storage', doc.storageKey);

    const extractionResult = await extractDocumentText(filePath, doc.mimeType);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: extractionResult.text,
        wordCount: extractionResult.wordCount,
        pageCount: extractionResult.pages.length,
      }
    });

    for (const page of extractionResult.pages) {
      await prisma.page.create({
        data: {
          documentId,
          pageNumber: page.pageNumber,
          text: page.text
        }
      });
    }

    const chunks = chunkDocument(extractionResult.pages);

    for (const chunk of chunks) {
      await prisma.chunk.create({
        data: {
          documentId,
          pageStart: chunk.pageStart,
          pageEnd: chunk.pageEnd,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          startOffset: chunk.startOffset,
          endOffset: chunk.endOffset,
        }
      });
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'READY' }
    });

  } catch (error: any) {
    console.error('Processing error:', error);
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'FAILED',
        processingError: error.message || 'Unknown processing error'
      }
    });
  }
}
