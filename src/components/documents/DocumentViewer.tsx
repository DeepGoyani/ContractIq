"use client"
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDocumentContext } from "./DocumentContext";
import { useEffect, useRef } from "react";

export function DocumentViewer({ document, pages }: { document: any, pages: any[] }) {
  const { activeCitation } = useDocumentContext();
  const highlightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeCitation && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCitation]);

  const renderHighlightedText = (text: string) => {
    if (!activeCitation || !activeCitation.text) return text;
    
    // Case-insensitive exact match
    const lowerText = text.toLowerCase();
    const lowerQuery = activeCitation.text.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + activeCitation.text.length);
    const after = text.substring(index + activeCitation.text.length);
    
    return (
      <>
        {before}
        <span ref={highlightRef} className="bg-yellow-200 text-yellow-900 px-1 py-0.5 rounded-sm font-semibold shadow-sm transition-all duration-500 shadow-yellow-200">
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b flex items-center px-4 justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <h1 className="font-semibold text-sm truncate max-w-[300px]" title={document.originalName}>
              {document.originalName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{document.pageCount} pages</span>
          <span>•</span>
          <span>{document.wordCount?.toLocaleString() || 0} words</span>
        </div>
      </header>

      <Tabs defaultValue="document" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 border-b bg-slate-50">
          <TabsList className="h-10 mt-2 mb-0">
            <TabsTrigger value="document">Document View</TabsTrigger>
            <TabsTrigger value="outline">Outline</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="document" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full bg-slate-100 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              {pages.map((page) => (
                <div key={page.id} className="bg-white p-8 md:p-12 shadow-sm border rounded-sm min-h-[800px] relative">
                  <div className="absolute top-4 right-4 text-xs text-slate-400 font-mono">Page {page.pageNumber}</div>
                  <div className="prose prose-sm md:prose-base max-w-none prose-slate" style={{ whiteSpace: 'pre-wrap' }}>
                    {renderHighlightedText(page.text)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="outline" className="flex-1 p-6 overflow-auto">
          <div className="text-sm text-slate-500 text-center mt-10">
            <p>Smart outline extraction is processing...</p>
            <p className="mt-2">Check back soon for structural navigation.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
