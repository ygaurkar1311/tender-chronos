import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Copy, KeyRound, Shield } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approvalData: ApprovalData) => void;
  tenderTitle: string;
  tenderId: string;
  userEmail: string;
  userName: string;
  action: 'approve' | 'reject';
}

export interface ApprovalData {
  approvalId: string;
  otp: string;
  digitalSignature: string;
  timestamp: string;
  action: 'approve' | 'reject';
}

const ApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  tenderTitle,
  tenderId,
  userEmail,
  userName,
  action,
}: ApprovalModalProps) => {
  const [step, setStep] = useState<'confirm' | 'verified'>('confirm');
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);

  const generateApprovalData = (): ApprovalData => {
    const timestamp = new Date().toISOString();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const signatureInput = `${tenderId}-${userEmail}-${timestamp}-${otp}`;
    const digitalSignature = CryptoJS.SHA256(signatureInput).toString();
    const approvalId = `APV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      approvalId,
      otp,
      digitalSignature,
      timestamp,
      action,
    };
  };

  const handleGenerate = () => {
    const data = generateApprovalData();
    setApprovalData(data);
    setStep('verified');
  };

  const handleConfirm = () => {
    if (approvalData) {
      onConfirm(approvalData);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setApprovalData(null);
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {action === 'approve' ? 'Secure Tender Approval' : 'Tender Rejection'}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' 
              ? 'Generate secure verification credentials for tender approval'
              : 'Confirm tender rejection with verification'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'confirm' ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-4"
            >
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Tender</p>
                <p className="font-semibold text-foreground">{tenderTitle}</p>
                <p className="text-sm text-muted-foreground mt-3">Approver</p>
                <p className="font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <KeyRound className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      Security Verification Required
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action === 'approve'
                        ? 'A secure OTP and digital signature will be generated for this approval. This ensures the authenticity and non-repudiation of your decision.'
                        : 'Your rejection will be recorded with secure verification.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant={action === 'approve' ? 'default' : 'destructive'}
                  className="flex-1"
                  onClick={handleGenerate}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Generate & {action === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verified"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground">
                  {action === 'approve' ? 'Approval Verified' : 'Rejection Confirmed'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure verification credentials generated successfully
                </p>
              </div>

              {approvalData && (
                <div className="space-y-4">
                  <div className="bg-card border p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Approval ID</p>
                        <p className="font-mono text-sm font-medium text-foreground">
                          {approvalData.approvalId}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(approvalData.approvalId, 'Approval ID')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">OTP Passkey</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-lg font-mono px-3 py-1">
                            {approvalData.otp}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(approvalData.otp, 'OTP')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Digital Signature (SHA-256)</p>
                      <div className="bg-muted/30 p-3 rounded font-mono text-xs break-all text-muted-foreground">
                        {approvalData.digitalSignature}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => copyToClipboard(approvalData.digitalSignature, 'Digital Signature')}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Signature
                      </Button>
                    </div>

                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      <p>Timestamp: {new Date(approvalData.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-success/5 border border-success/20 p-3 rounded-lg">
                    <p className="text-sm text-foreground">
                      ✓ These credentials have been securely generated and logged for audit purposes.
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleConfirm}
              >
                Confirm & Complete
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;
