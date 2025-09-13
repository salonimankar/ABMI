import React, { useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentAnalysisProps {
  onQuestionsGenerated: (questions: string[]) => void;
}

function DocumentAnalysis({ onQuestionsGenerated }: DocumentAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/json' ||
          selectedFile.type === 'text/plain') {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a PDF, JSON, or text file');
      }
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze document');

      const data = await response.json();
      onQuestionsGenerated(data.questions);
      toast.success('Document analyzed successfully');
    } catch (err) {
      console.error('Error analyzing document:', err);
      toast.error('Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-secondary rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Document Analysis</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-accent rounded-lg p-8 text-center">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.json,.txt"
            onChange={handleFileChange}
          />
          <label
            htmlFor="document-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Upload your resume, LinkedIn export, or GitHub profile JSON
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, JSON, and TXT files
            </p>
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between bg-background p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="truncate max-w-[200px]">{file.name}</span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          onClick={analyzeDocument}
          disabled={!file || loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Analyze Document
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default DocumentAnalysis;