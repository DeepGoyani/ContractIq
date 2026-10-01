import mammoth from 'mammoth';
import { readFile } from 'fs/promises';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  text: string;
  wordCount: number;
}

export async function extractDocumentText(filePath: string, mimeType: string): Promise<ExtractionResult> {
  if (mimeType === 'application/pdf') {
    return extractPDF(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDOCX(filePath);
  }
  throw new Error('Unsupported file type');
}

async function extractPDF(filePath: string): Promise<ExtractionResult> {
  const pdfParse = require('pdf-parse');
  const dataBuffer = await readFile(filePath);
  
  const pages: ExtractedPage[] = [];
  
  const options = {
    pagerender: function(pageData: any) {
      return pageData.getTextContent().then(function(textContent: any) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY){
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }    
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pageData.pageIndex + 1,
          text: text.trim()
        });
        return text;
      });
    }
  };

  const data = await pdfParse(dataBuffer, options);
  
  const meaningfulCharacterCount = data.text.replace(/\s/g, '').length;
  if (meaningfulCharacterCount < 100) {
    throw new Error('NO_READABLE_TEXT');
  }

  const wordCount = data.text.split(/\s+/).filter((w: string) => w.length > 0).length;

  return {
    pages,
    text: data.text,
    wordCount
  };
}

async function extractDOCX(filePath: string): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  
  const pages = [{
    pageNumber: 1,
    text: text
  }];

  const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;

  return {
    pages,
    text,
    wordCount
  };
}
