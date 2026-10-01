import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DocumentProvider } from "@/components/documents/DocumentContext";
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
    <DocumentProvider>
      <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
        {/* Left Pane - Document Viewer */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r border-b bg-white h-[50vh] lg:h-auto">
          <DocumentViewer document={document} pages={document.pages} />
        </div>

        {/* Right Pane - AI Chat */}
        <div className="w-full lg:w-[450px] lg:flex-shrink-0 bg-slate-50 flex flex-col h-[50vh] lg:h-auto">
          <ChatPanel documentId={document.id} />
        </div>
      </div>
    </DocumentProvider>
  );
}
