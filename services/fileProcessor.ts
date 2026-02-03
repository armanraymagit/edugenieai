import * as pdfjs from 'pdfjs-dist';
import readXlsxFile from 'read-excel-file';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import { summarizeImage } from './ai';

// Set worker for PDF.js (in browser environment)
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjs) {
  (pdfjs as any).GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as any).version}/pdf.worker.min.js`;
}

export type ProcessedFile = {
  content: string;
  type: string;
  name: string;
};

/**
 * Service to extract text from various file formats
 */
export class FileProcessor {
  /**
   * Process a single file based on its type
   */
  static async processFile(file: File): Promise<ProcessedFile> {
    const type = file.type || this.getFileExtension(file.name);
    let content = '';

    try {
      if (type.includes('pdf')) {
        content = await this.extractTextFromPDF(file);
      } else if (file.name.endsWith('.xlsx')) {
        content = await this.extractTextFromExcel(file);
      } else if (type.includes('csv') || file.name.endsWith('.csv')) {
        content = await this.extractTextFromCSV(file);
      } else if (
        type.includes('word') ||
        type.includes('officedocument.wordprocessingml') ||
        file.name.endsWith('.docx')
      ) {
        content = await this.extractTextFromDocx(file);
      } else if (type.includes('text/plain') || file.name.endsWith('.txt')) {
        content = await file.text();
      } else if (type.includes('image')) {
        content = await this.processImage(file);
      } else {
        // Fallback for unknown types
        content = await file.text();
      }

      return {
        content,
        type,
        name: file.name,
      };
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(
        `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Extract text from PDF using PDF.js
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  }

  /**
   * Extract text from Excel using read-excel-file (Secure alternative to xlsx)
   */
  private static async extractTextFromExcel(file: File): Promise<string> {
    const rows = await readXlsxFile(file);
    return rows.map((row) => row.join(' | ')).join('\n');
  }

  /**
   * Extract text from CSV using PapaParse (Secure alternative to xlsx)
   */
  private static async extractTextFromCSV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const content = results.data
            .map((row: any) => (Array.isArray(row) ? row.join(' | ') : ''))
            .join('\n');
          resolve(content);
        },
        error: (error) => reject(error),
        header: false,
        skipEmptyLines: true,
      });
    });
  }

  /**
   * Extract text from .docx using Mammoth
   */
  private static async extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }

  /**
   * Process image using existing AI summarization
   */
  private static async processImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const summary = await summarizeImage(base64, file.type);
          resolve(`[Image Description]: ${summary}`);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
