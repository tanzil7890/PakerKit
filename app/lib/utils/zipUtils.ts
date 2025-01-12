import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function generateAndSaveZip(files: Array<{ content: Blob; filename: string }>) {
  const zip = new JSZip();
  
  files.forEach(({ content, filename }) => {
    zip.file(filename, content, { binary: true });
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'documents.zip');
} 