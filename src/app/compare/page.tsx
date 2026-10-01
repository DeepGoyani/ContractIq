import { CompareClient } from "@/components/comparison/CompareClient";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const documents = await prisma.document.findMany({
    where: { status: 'READY' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Compare Contracts</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Select Versions</h2>
          <p className="text-slate-500 mt-2">Select the original and revised versions of a contract to highlight differences and automatically analyze critical clause changes.</p>
        </div>
        
        <CompareClient documents={documents} />
      </main>
    </div>
  );
}
