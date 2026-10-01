import { tool } from 'ai';
import { z } from 'zod';
import { searchDocumentChunks } from '../documents/search';
import prisma from '@/lib/prisma';

export const documentTools = {
  search_document: tool({
    description: 'Search the document for relevant passages.',
    parameters: z.object({
      query: z.string().describe('The search query (e.g. "termination notice period")'),
      documentIds: z.array(z.string()).describe('The IDs of the documents to search in'),
    }),
    // @ts-ignore
    execute: async ({ query, documentIds }: { query: string; documentIds: string[] }) => {
      try {
        const results = await searchDocumentChunks({ query, documentIds, limit: 10 });
        if (results.length === 0) {
          return { message: 'No evidence found for this query in the document.' };
        }
        return { results };
      } catch (error: any) {
        return { error: 'Unknown tool error: ' + error.message };
      }
    },
  }),

  get_section: tool({
    description: 'Retrieve a specific section or clause from the document by title or number.',
    parameters: z.object({
      documentId: z.string().describe('The document ID'),
      sectionId: z.string().describe('The section number or heading to retrieve (e.g. "12.2")'),
    }),
    // @ts-ignore
    execute: async ({ documentId, sectionId }: { documentId: string; sectionId: string }) => {
      try {
        // Fallback to text search since precise section parsing isn't deeply implemented for now
        const results = await searchDocumentChunks({ query: sectionId, documentIds: [documentId], limit: 3 });
        return { results };
      } catch (error: any) {
        return { error: 'Unknown tool error: ' + error.message };
      }
    },
  }),

  list_clauses: tool({
    description: 'List identified contract clauses in the document.',
    parameters: z.object({
      documentId: z.string().describe('The document ID'),
    }),
    // @ts-ignore
    execute: async ({ documentId }: { documentId: string }) => {
      try {
        // Not fully implemented structurally, will fallback to searching common clauses
        const commonClauses = ['Definitions', 'Term', 'Termination', 'Liability', 'Indemnification'];
        return { clauses: commonClauses, note: "Full structural clause list not available." };
      } catch (error: any) {
        return { error: 'Unknown tool error: ' + error.message };
      }
    },
  }),

  get_document_metadata: tool({
    description: 'Get metadata about the document (pages, word count, status)',
    parameters: z.object({
      documentId: z.string().describe('The document ID'),
    }),
    // @ts-ignore
    execute: async ({ documentId }: { documentId: string }) => {
      if (!documentId) return { error: 'document_id is required' };
      try {
        const doc = await prisma.document.findUnique({
          where: { id: documentId },
          select: { pageCount: true, wordCount: true, status: true }
        });
        if (!doc) return { error: 'Document not found' };
        return doc;
      } catch (error: any) {
        return { error: 'Unknown tool error: ' + error.message };
      }
    },
  }),
};
