import { Loader2 } from "lucide-react";

export default function DocumentLoading() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse text-sm">Loading document workspace...</p>
      </div>
    </div>
  );
}
