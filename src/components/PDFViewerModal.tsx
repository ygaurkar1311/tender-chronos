import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfFile?: string;
  fileName?: string;
}

const PDFViewerModal = ({ isOpen, onClose, pdfFile, fileName }: PDFViewerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {fileName || 'Tender Document'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 relative bg-muted/20 rounded-lg overflow-hidden">
          {pdfFile ? (
            <div className="relative w-full h-full">
              {/* Watermark overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="transform -rotate-45 text-6xl font-bold text-muted-foreground/10 select-none">
                  READ-ONLY • FOR APPROVAL ONLY
                </div>
              </div>
              
              {/* PDF Viewer */}
              <iframe
                src={pdfFile}
                className="w-full h-full border-0"
                title="PDF Viewer"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg">No PDF document attached</p>
              <p className="text-sm">The coordinator hasn't uploaded a PDF for this tender</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            This document is read-only and for approval purposes only
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerModal;
