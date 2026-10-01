import { ExtractedPage } from './extraction';

export interface Chunk {
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
  text: string;
  startOffset: number;
  endOffset: number;
}

export function chunkDocument(pages: ExtractedPage[]): Chunk[] {
  const chunks: Chunk[] = [];
  const TARGET_CHARS = 4000;
  
  let currentChunkText = '';
  let currentChunkStartIndex = 0;
  let pageStart = 1;
  let globalOffset = 0;
  let chunkIndex = 0;

  for (const page of pages) {
    let pageOffset = 0;
    const text = page.text;
    
    const paragraphs = text.split('\n\n');
    
    for (const para of paragraphs) {
      if (currentChunkText.length + para.length > TARGET_CHARS && currentChunkText.length > 0) {
        chunks.push({
          pageStart,
          pageEnd: page.pageNumber,
          chunkIndex: chunkIndex++,
          text: currentChunkText.trim(),
          startOffset: currentChunkStartIndex,
          endOffset: currentChunkStartIndex + currentChunkText.length
        });
        
        currentChunkText = para + '\n\n';
        currentChunkStartIndex = globalOffset + pageOffset;
        pageStart = page.pageNumber;
      } else {
        if (currentChunkText.length === 0) {
          pageStart = page.pageNumber;
          currentChunkStartIndex = globalOffset + pageOffset;
        }
        currentChunkText += para + '\n\n';
      }
      pageOffset += para.length + 2; 
    }
    
    globalOffset += text.length;
  }
  
  if (currentChunkText.length > 0) {
    chunks.push({
      pageStart,
      pageEnd: pages[pages.length - 1].pageNumber,
      chunkIndex: chunkIndex++,
      text: currentChunkText.trim(),
      startOffset: currentChunkStartIndex,
      endOffset: currentChunkStartIndex + currentChunkText.length
    });
  }
  
  return chunks;
}
