import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rejectionData: {
    approvalId: string;
    timestamp: string;
    remarks: string;
  }) => void;
  tenderTitle: string;
  tenderId: string;
  userEmail: string;
  userName: string;
}

const RejectionModal = ({
  isOpen,
  onClose,
  tenderTitle,
  tenderId,
  userEmail,
  userName,
  onConfirm,
}: RejectionModalProps) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!remarks.trim()) {
      return;
    }

    setLoading(true);
    const timestamp = new Date().toISOString();
    const rejectionId = `REJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    onConfirm({
      approvalId: rejectionId,
      timestamp,
      remarks: remarks.trim(),
    });

    setRemarks('');
    setLoading(false);
  };

  const handleClose = () => {
    setRemarks('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Reject Tender
          </DialogTitle>
          <DialogDescription>
            Provide detailed remarks for rejecting this tender
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Tender:</span> {tenderTitle}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Reviewer:</span> {userName}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">Email:</span> {userEmail}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">
              Rejection Remarks <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="remarks"
              placeholder="Specify the issues or required changes in detail..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={6}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what needs to be corrected or changed
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!remarks.trim() || loading}
            >
              {loading ? 'Rejecting...' : 'Reject with Remarks'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionModal;
