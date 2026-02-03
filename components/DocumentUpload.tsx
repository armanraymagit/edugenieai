import React, { useState, useRef } from 'react';
import { FileProcessor, ProcessedFile } from '../services/fileProcessor';
import { initializeVectorDb } from '../services/vectorDb';

interface DocumentUploadProps {
  onUploadComplete?: (files: ProcessedFile[]) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    const processedFiles: ProcessedFile[] = [];

    try {
      setStatus('Initializing Vector Database...');
      const vectorDb = await initializeVectorDb();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const percent = Math.round((i / files.length) * 100);
        setProgress(percent);
        setStatus(`Processing ${file.name}...`);

        const processed = await FileProcessor.processFile(file);
        processedFiles.push(processed);

        setStatus(`Indexing ${file.name}...`);
        await vectorDb.addDocuments([
          {
            id: `doc_${Date.now()}_${i}`,
            content: processed.content,
            metadata: {
              filename: file.name,
              type: file.type,
              processedAt: Date.now(),
            },
          },
        ]);
      }

      setStatus('All files indexed successfully!');
      setProgress(100);
      if (onUploadComplete) onUploadComplete(processedFiles);

      // Clear status after 3 seconds
      setTimeout(() => {
        setStatus('');
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          multiple
          accept=".pdf,.docx,.xlsx,.csv,.txt,image/*"
        />

        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-800">Drop files here</h3>
        <p className="text-sm text-slate-500 mt-1">PDF, Word, Excel, CSV, TXT or Images</p>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-indigo-600">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {status && !isProcessing && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold animate-slideUp ${
            status.includes('Error')
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {status.includes('Error') ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <span>{status}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
