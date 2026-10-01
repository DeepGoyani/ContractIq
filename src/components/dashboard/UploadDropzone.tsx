"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, File, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PDF or DOCX files.")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File exceeds the 50 MB limit.")
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 90))
      }, 500)

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(interval)
      setUploadProgress(100)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const data = await res.json()
      toast.success("Document uploaded successfully!")
      
      // Redirect to the document workspace immediately so user can see processing state
      router.push(`/documents/${data.documentId}`)
      
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to upload document")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card className={`border-dashed border-2 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
      <CardContent className="p-8">
        <div 
          className="flex flex-col items-center justify-center text-center space-y-4 cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".pdf,.docx" 
          />
          
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            ) : (
              <UploadCloud className="h-8 w-8 text-slate-400" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-lg">
              {isUploading ? "Uploading..." : "Upload Contract"}
            </h3>
            <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
              {isUploading 
                ? "Please wait while we process your document" 
                : "Drag & drop your PDF or DOCX here, or click to browse"}
            </p>
          </div>

          {isUploading && (
            <div className="w-full max-w-xs mt-4">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {!isUploading && (
            <Button type="button" variant="secondary" className="mt-2">
              Select File
            </Button>
          )}
          
          <p className="text-xs text-slate-400 pt-4">
            Maximum file size: 50 MB
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
