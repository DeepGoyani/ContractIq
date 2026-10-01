import { streamText } from 'ai';
import { getModel } from '@/server/ai/provider';
import { documentTools } from '@/server/ai/tools';
import { SYSTEM_PROMPT } from '@/server/ai/agent';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, documentId, conversationId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    // Save user message to database if conversationId is provided
    if (conversationId) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await prisma.message.create({
          data: {
            conversationId,
            documentId,
            role: 'USER',
            content: lastMessage.content,
            status: 'COMPLETED',
          }
        });
      }
    }

    const result = streamText({
      model: getModel(),
      system: SYSTEM_PROMPT + `\n\nEnsure your final response includes clear quotes if you are referencing the document. The current document ID is: ${documentId}`,
      messages,
      tools: documentTools,
      // @ts-ignore
      maxSteps: 5,
      onFinish: async ({ text }) => {
        // Save the assistant's final response to the database
        if (conversationId) {
          await prisma.message.create({
            data: {
              conversationId,
              documentId,
              role: 'ASSISTANT',
              content: text,
              status: 'COMPLETED',
            }
          });
        }
      }
    });

    return (result as any).toDataStreamResponse ? (result as any).toDataStreamResponse() : (result as any).toTextStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
