import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DocumentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      pages: {
        orderBy: { pageNumber: 'asc' }
      }
    }
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Pane - Document Viewer */}
      <div className="flex-1 flex flex-col min-w-0 border-r bg-white">
        <DocumentViewer document={document} pages={document.pages} />
      </div>

      {/* Right Pane - AI Chat */}
      <div className="w-[450px] flex-shrink-0 bg-slate-50 flex flex-col">
        <ChatPanel documentId={document.id} />
      </div>
    </div>
  );
}
