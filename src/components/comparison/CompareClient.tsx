"use client"

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, GitCompare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

export function CompareClient({ documents }: { documents: any[] }) {
  const [doc1, setDoc1] = useState<string>("");
  const [doc2, setDoc2] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      toast.error("Please select two documents to compare");
      return;
    }
    
    setIsComparing(true);
    setResults(null);
    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalDocumentId: doc1, revisedDocumentId: doc2 })
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.comparisons);
      toast.success("Comparison complete!");
    } catch (err: any) {
      toast.error("Comparison failed: " + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className={doc1 ? "border-indigo-500" : ""}>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-lg">Original Document</h3>
            <select 
              className="w-full p-2 border rounded-md bg-slate-50"
              value={doc1}
              onChange={e => setDoc1(e.target.value)}
            >
              <option value="">Select a document...</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.originalName}</option>
              ))}
            </select>
          </CardContent>
        </Card>
        
        <Card className={doc2 ? "border-indigo-500" : ""}>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-lg">Revised Document</h3>
            <select 
              className="w-full p-2 border rounded-md bg-slate-50"
              value={doc2}
              onChange={e => setDoc2(e.target.value)}
            >
              <option value="">Select a document...</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.originalName}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleCompare} 
          disabled={!doc1 || !doc2 || isComparing}
          className="gap-2 px-8"
        >
          {isComparing ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitCompare className="h-5 w-5" />}
          {isComparing ? "Analyzing Differences..." : "Compare Contracts"}
        </Button>
      </div>

      {results && (
        <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold border-b pb-4">Comparison Results</h3>
          
          {results.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-900">No significant changes found</h4>
              <p className="text-slate-500">The contracts appear to have no major semantic differences.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {results.map((res: any, idx: number) => (
                <Card key={idx} className="overflow-hidden">
                  <div className={`h-1.5 w-full ${res.impact === 'High' ? 'bg-red-500' : res.impact === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${res.impact === 'High' ? 'bg-red-100 text-red-700' : res.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {res.impact} Impact
                      </span>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{res.changeType}</span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-slate-700 mb-6">
                      <p>{res.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2 border-b pb-1">Original</h5>
                        <p className="text-slate-600 line-through decoration-red-300 bg-red-50/50 p-2 rounded">{res.originalText || "N/A"}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2 border-b pb-1">Revised</h5>
                        <p className="text-slate-600 bg-green-50/50 p-2 rounded">{res.revisedText || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
