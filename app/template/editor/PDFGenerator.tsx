import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateAndSaveZip } from '../../lib/utils/zipUtils';
import { Progress } from "@/components/ui/progress";

interface PDFGeneratorProps {
  variables: Array<{ name: string; type: 'custom' | 'csv' }>;
  csvData?: Array<Record<string, string>>;
}

export default function PDFGenerator({ variables, csvData }: PDFGeneratorProps) {
  const [editor] = useLexicalComposerContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  const replaceVariables = (content: string, rowData: Record<string, string>) => {
    let processedContent = content;
    
    // Handle CSV variables specifically
    Object.entries(rowData).forEach(([key, value]) => {
      // Create the placeholder pattern matching the exact case from the editor
      const placeholder = `{{${key}}}`;
      // Create a global regex to replace all instances
      const regex = new RegExp(escapeRegExp(placeholder), 'gi'); // Added 'i' flag for case-insensitive
      processedContent = processedContent.replace(regex, value);
    });
    
    return processedContent;
  };

  // Utility function to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const createPDFContent = (htmlContent: string, rowData?: Record<string, string>) => {
    let processedContent = htmlContent;
    
    if (rowData) {
      processedContent = replaceVariables(processedContent, rowData);
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          .pdf-export-container {
            padding: 40px;
            font-family: Arial, sans-serif;
            color: #000;
            width: 8.5in;
            margin: 0 auto;
            box-sizing: border-box;
          }
          ${getGoogleDocsStyles()}
        </style>
      </head>
      <body>
        <div class="pdf-export-container">
          ${processedContent}
        </div>
      </body>
      </html>
    `;
  };

  const handleGenerate = async (asZip: boolean) => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Get HTML content from Lexical editor
      const htmlContent = editor.getEditorState().read(() => {
        return $generateHtmlFromNodes(editor);
      });

      if (csvData && csvData.length > 0) {
        const pdfs = [];
        const totalRows = csvData.length;

        for (let i = 0; i < totalRows; i++) {
          const row = csvData[i];
          // Process the row data
          const processedContent = createPDFContent(htmlContent, row);
          
          const response = await fetch('/api/export-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              html: processedContent,
              filename: `document_${i + 1}.pdf`
            }),
          });

          if (asZip) {
            const pdfBlob = await response.blob();
            pdfs.push({
              content: pdfBlob,
              filename: `document_${i + 1}.pdf`
            });
          } else {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document_${i + 1}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          }

          setProgress(((i + 1) / totalRows) * 100);
        }

        if (asZip) {
          await generateAndSaveZip(pdfs);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      setShowDialog(false);
      setProgress(0);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={isGenerating}
      >
        <FileDown className="h-4 w-4 mr-2" />
        {isGenerating ? 'Generating...' : 'Generate PDF'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate PDF</DialogTitle>
            <DialogDescription>
              {csvData && csvData.length > 0 
                ? `Generate ${csvData.length} PDFs using CSV data`
                : 'Generate a single PDF'}
            </DialogDescription>
          </DialogHeader>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-500 text-center">
                Generating PDFs... {Math.round(progress)}%
              </p>
            </div>
          )}

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
              >
                {csvData && csvData.length > 0 ? 'Individual Files' : 'Generate PDF'}
              </Button>
              {csvData && csvData.length > 1 && (
                <Button
                  variant="default"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                >
                  Download as ZIP
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getGoogleDocsStyles() {
  return `
    h1 { 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 16px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    h2 { 
      font-size: 20px; 
      font-weight: bold; 
      margin-bottom: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    h3 { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    p { 
      font-size: 12px; 
      line-height: 1.5; 
      margin-bottom: 12px;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    ul { 
      list-style-type: disc !important;
      padding-left: 24px !important;
      margin-bottom: 12px;
    }
    ul li {
      font-size: 12px;
      line-height: 1.5;
      margin-bottom: 6px;
      page-break-inside: avoid;
      display: list-item !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      margin-bottom: 1em;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    td, th {
      border: 1px solid #ddd;
      padding: 8px;
      font-size: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
      page-break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
    }
  `;
} 