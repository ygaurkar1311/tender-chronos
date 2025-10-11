import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface EMDPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenderTitle: string;
  emdAmount: number;
}

const EMDPaymentModal = ({ open, onClose, onSuccess, tenderTitle, emdAmount }: EMDPaymentModalProps) => {
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !cvv || !expiryDate) {
      toast.error('Please fill in all payment details');
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      toast.success('EMD Payment Successful!');
      
      // Wait 2 seconds before closing and calling success
      setTimeout(() => {
        onSuccess();
        onClose();
        setPaymentSuccess(false);
        setCardNumber('');
        setCvv('');
        setExpiryDate('');
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      setPaymentSuccess(false);
      setCardNumber('');
      setCvv('');
      setExpiryDate('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            EMD Payment Required
          </DialogTitle>
          <DialogDescription>
            To view full tender details and submit your bid, please pay the Earnest Money Deposit (EMD).
          </DialogDescription>
        </DialogHeader>

        {!paymentSuccess ? (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Tender: {tenderTitle}</p>
              <p className="text-2xl font-bold text-foreground">₹{emdAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">EMD Amount (Refundable)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{emdAmount.toLocaleString()}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your EMD payment has been processed successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                You can now view tender details and submit your bid.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EMDPaymentModal;
