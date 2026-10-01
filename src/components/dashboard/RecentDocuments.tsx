"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface DocumentItem {
  id: string
  originalName: string
  mimeType: string
  pageCount: number | null
  wordCount: number | null
  status: 'PROCESSING' | 'READY' | 'FAILED'
  createdAt: Date
}

export function RecentDocuments({ documents }: { documents: DocumentItem[] }) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your recently uploaded contracts will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="h-10 w-10 text-slate-300 mb-4" />
          <p className="text-sm text-slate-500">No contracts yet.</p>
          <p className="text-sm text-slate-500">Upload a PDF or DOCX to start analysing your first contract.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>Review and analyze your latest uploads.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map(doc => (
          <div key={doc.id} className="group relative flex flex-col justify-between p-4 border rounded-xl hover:border-slate-300 transition-all bg-white shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium truncate" title={doc.originalName}>{doc.originalName}</h3>
              </div>
              
              <div className="text-xs text-slate-500 mb-4 space-y-1">
                <p>{doc.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} • {doc.pageCount || '?'} pages</p>
                {doc.wordCount && <p>{doc.wordCount.toLocaleString()} words</p>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs font-medium">
                {doc.status === 'READY' && <><CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" /> <span className="text-green-700">Processed</span></>}
                {doc.status === 'PROCESSING' && <><Loader2 className="h-3.5 w-3.5 text-amber-500 mr-1.5 animate-spin" /> <span className="text-amber-700">Processing</span></>}
                {doc.status === 'FAILED' && <><AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1.5" /> <span className="text-red-700">Failed</span></>}
              </div>
              
              {doc.status === 'READY' && (
                <Link href={`/documents/${doc.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    Open <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="absolute top-4 right-4 text-[10px] text-slate-400">
              {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
