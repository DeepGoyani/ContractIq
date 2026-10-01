import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '../ai/provider';
import prisma from '@/lib/prisma';

export const ClauseChangeSchema = z.object({
  clauseName: z.string(),
  type: z.enum(['ADDED', 'REMOVED', 'MODIFIED', 'UNCHANGED']),
  significance: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  oldText: z.string().optional(),
  newText: z.string().optional(),
  summary: z.string().optional(),
});

export type ClauseChange = z.infer<typeof ClauseChangeSchema>;

export async function compareDocuments(docAId: string, docBId: string): Promise<ClauseChange[]> {
  const docA = await prisma.document.findUnique({ where: { id: docAId } });
  const docB = await prisma.document.findUnique({ where: { id: docBId } });

  if (!docA || !docB) throw new Error('Documents not found');
  
  const clausesToCompare = ['Liability', 'Termination', 'Indemnification', 'Payment', 'Confidentiality', 'Intellectual Property', 'Data Protection', 'Governing Law'];
  const changes: ClauseChange[] = [];

  for (const clause of clausesToCompare) {
    const aChunks = await prisma.chunk.findMany({
      where: { documentId: docAId, text: { contains: clause, mode: 'insensitive' } },
      take: 2
    });
    
    const bChunks = await prisma.chunk.findMany({
      where: { documentId: docBId, text: { contains: clause, mode: 'insensitive' } },
      take: 2
    });
    
    if (aChunks.length === 0 && bChunks.length === 0) continue;

    const aText = aChunks.map(c => c.text).join('\n...\n');
    const bText = bChunks.map(c => c.text).join('\n...\n');

    const result = await generateObject({
      model: getModel(),
      schema: ClauseChangeSchema,
      prompt: `Compare the "${clause}" clause between two versions of a contract.
      
      Version A (Old):
      ${aText || "Not found"}
      
      Version B (New):
      ${bText || "Not found"}
      
      Determine if it was added, removed, modified, or unchanged. 
      If modified, rate significance (HIGH/MEDIUM/LOW) and summarize the substantive change.
      Provide the old text snippet and new text snippet.
      `
    });

    if (result.object.type !== 'UNCHANGED' || aChunks.length > 0 || bChunks.length > 0) {
      changes.push({ ...result.object, clauseName: clause });
    }
  }

  return changes;
}
