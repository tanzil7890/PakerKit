import { useCallback, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
/* import { exportWithPDFMake } from './exporters/PDFMakeExporter'; */
import { exportWithPuppeteer } from './exporters/PuppeteerExporter';

export function ExportPDF() {
  const [editor] = useLexicalComposerContext();
  const [showDialog, setShowDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (method: 'pdfmake' | 'puppeteer') => {
    setIsExporting(true);
    try {
      if (method === 'pdfmake') {
       /*  await exportWithPDFMake(editor); */
      } else {
        await exportWithPuppeteer(editor);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
      setShowDialog(false);
    }
  }, [editor]);

  return (
    <>
      <Button
        variant="default"
        onClick={() => setShowDialog(true)}
        className="bg-blue-600 hover:bg-blue-700"
        disabled={isExporting}
      >
        <FileDown className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export PDF</DialogTitle>
            <DialogDescription>
              Choose your preferred export method
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            {/* <Button
              variant="outline"
              onClick={() => handleExport('pdfmake')}
              disabled={isExporting}
            >
              PDFMake
            </Button> */}
            <Button
              variant="default"
              onClick={() => handleExport('puppeteer')}
              disabled={isExporting}
            >
              Puppeteer (Better Quality)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ExportPDF; 