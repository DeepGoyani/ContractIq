"use client"
import { useChat } from 'ai/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Loader2, Info } from "lucide-react";
import { useEffect, useRef } from 'react';

export function ChatPanel({ documentId }: { documentId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { documentId }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="h-14 border-b flex items-center px-4 justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <h2 className="font-semibold text-sm">Contract Assistant</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed mt-4 space-y-3">
              <Info className="h-6 w-6 text-indigo-400 mx-auto" />
              <p className="text-sm text-slate-600">
                Ask anything about this contract. I can find specific clauses, summarize terms, or verify obligations.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-900 rounded-tl-none'}`}>
                {m.content}
                {m.toolInvocations && m.toolInvocations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.toolInvocations.map(t => (
                      <div key={t.toolCallId} className="p-2 bg-white/50 rounded-md border border-slate-200 text-xs text-slate-600 font-mono shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-800 font-medium">
                          <Loader2 className={`h-3 w-3 ${t.state === 'result' ? 'text-green-500' : 'animate-spin text-indigo-500'}`} />
                          {t.toolName === 'search_document' ? `Searching contract database...` : `Running ${t.toolName}...`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about this contract..." 
            className="flex-1 pr-10 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
          </Button>
        </form>
        <div className="text-[10px] text-center text-slate-400 mt-2">
          AI can make mistakes. Always review critical clauses.
        </div>
      </div>
    </div>
  );
}
