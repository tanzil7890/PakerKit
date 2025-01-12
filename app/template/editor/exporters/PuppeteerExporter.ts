import { LexicalEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';

export async function exportWithPuppeteer(editor: LexicalEditor) {
  const htmlContent = editor.getEditorState().read(() => {
    return $generateHtmlFromNodes(editor);
  });

  // Using styles from PDFGenerator.tsx for consistency
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        ${getGoogleDocsStyles()}
      </style>
    </head>
    <body>
      <div class="pdf-export-container">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;

  const response = await fetch('/api/export-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ html: template }),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
}

function getGoogleDocsStyles() {
  return `
    .pdf-export-container {
      padding: 40px;
      font-family: Arial, sans-serif;
      color: #000;
      width: 8.5in;
      margin: 0 auto;
      box-sizing: border-box;
    }
    h1 { 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 16px;
    }
    h2 { 
      font-size: 20px; 
      font-weight: bold; 
      margin-bottom: 14px;
    }
    h3 { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 12px;
    }
    p { 
      font-size: 12px; 
      line-height: 1.5; 
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    ul { 
      list-style-type: disc !important;
      padding-left: 24px !important;
      margin-bottom: 12px;
    }
    .bold { font-weight: bold !important; }
    .italic { font-style: italic !important; }
    .underline { text-decoration: underline !important; }
  `;
} 