import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ComparePage() {
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
          <h2 className="text-2xl font-semibold tracking-tight">Upload Versions</h2>
          <p className="text-slate-500 mt-2">Upload the original and revised versions of a contract to highlight differences and automatically analyze critical clause changes.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-700">Original Document</h3>
            <UploadDropzone />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-700">Revised Document</h3>
            <UploadDropzone />
          </div>
        </div>
        
        <div className="text-center p-12 text-slate-400 border border-dashed rounded-xl bg-slate-50/50">
          Upload both documents to automatically generate an intelligent comparison report.
        </div>
      </main>
    </div>
  );
}
