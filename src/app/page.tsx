import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { StatsCards } from "@/components/dashboard/StatsCards";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  const totalDocs = await prisma.document.count();
  const processedDocs = await prisma.document.count({ where: { status: 'READY' } });
  const totalQuestions = await prisma.message.count({ where: { role: 'USER' } });
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xl">C</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ContractIQ</h1>
          <span className="text-sm text-slate-500 ml-2 hidden sm:inline-block border-l pl-3">AI Contract Intelligence</span>
        </div>
        <div className="flex gap-3">
          <Link href="/compare">
            <Button variant="outline">Compare Contracts</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <section className="text-center py-10 md:py-16 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Understand every clause. <br/> Verify every answer.
          </h2>
          <p className="text-lg text-slate-600">
            Ask questions about your contracts and trace every answer back to the original document with pinpoint accuracy.
          </p>
        </section>

        <StatsCards 
          totalDocs={totalDocs} 
          processedDocs={processedDocs} 
          totalQuestions={totalQuestions} 
          comparisons={0} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <RecentDocuments documents={documents} />
          </div>
          <div className="lg:sticky lg:top-24">
            <UploadDropzone />
          </div>
        </div>
      </main>
    </div>
  );
}
