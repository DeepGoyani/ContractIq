import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-medium animate-pulse">Loading ContractIQ...</p>
      </div>
    </div>
  );
}
