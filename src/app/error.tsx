"use client"
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-red-100 flex items-center justify-center rounded-full">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
          <p className="text-slate-500 text-sm">
            We encountered an unexpected error while processing your request.
          </p>
        </div>
        <Button onClick={() => reset()} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
