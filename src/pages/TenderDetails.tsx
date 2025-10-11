import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender, Bid } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import EMDPaymentModal from '@/components/EMDPaymentModal';
import { toast } from 'sonner';
import { ArrowLeft, Building, Calendar, User, Gavel, IndianRupee, Lock } from 'lucide-react';

const TenderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tender, setTender] = useState<Tender | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [hasEMDPaid, setHasEMDPaid] = useState(false);
  const [showEMDModal, setShowEMDModal] = useState(false);
  const [checkingEMD, setCheckingEMD] = useState(false);
  const [bidForm, setBidForm] = useState({
    amount: '',
    completionTime: '',
    remarks: '',
  });

  useEffect(() => {
    loadTenderDetails();
    if (user?.role === 'contractor') {
      checkEMDPayment();
    }
  }, [id, user]);

  const checkEMDPayment = async () => {
    if (!id || !user) return;
    setCheckingEMD(true);
    try {
      const hasPaid = await api.hasEMDPayment(id, user.id);
      setHasEMDPaid(hasPaid);
    } catch (error) {
      console.error('Failed to check EMD payment:', error);
    } finally {
      setCheckingEMD(false);
    }
  };

  const loadTenderDetails = async () => {
    try {
      const allTenders = await api.getTenders();
      const foundTender = allTenders.find(t => t.id === id);
      
      if (foundTender) {
        setTender(foundTender);
        const allBids = await api.getBids();
        const tenderBids = allBids.filter(b => b.tenderId === id);
        setBids(tenderBids);
      }
    } catch (error) {
      console.error('Failed to load tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEMDPaymentSuccess = async () => {
    if (!id || !user || !tender) return;
    
    try {
      await api.processEMDPayment({
        tenderId: id,
        contractorId: user.id,
        amount: tender.emdAmount,
      });
      setHasEMDPaid(true);
      setShowEMDModal(false);
      toast.success('EMD payment successful! You can now submit your bid.');
    } catch (error) {
      toast.error('Failed to process EMD payment');
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidForm.amount || parseFloat(bidForm.amount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (!bidForm.completionTime) {
      toast.error('Please enter expected completion time');
      return;
    }

    try {
      await api.submitBid({
        tenderId: id!,
        contractorId: user!.id,
        contractorName: user!.username,
        quotationAmount: parseFloat(bidForm.amount),
        expectedCompletionTime: bidForm.completionTime,
        remarks: bidForm.remarks,
      });
      toast.success('Bid submitted successfully');
      setShowBidForm(false);
      setBidForm({ amount: '', completionTime: '', remarks: '' });
      loadTenderDetails();
    } catch (error) {
      toast.error('Failed to submit bid');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tender) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Tender not found</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; variant: any }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    pending_approval: { label: 'Pending Approval', variant: 'default' },
    approved: { label: 'Approved', variant: 'default' },
    open: { label: 'Open for Bids', variant: 'default' },
    closed: { label: 'Closed', variant: 'secondary' },
    awarded: { label: 'Awarded', variant: 'default' },
  };

  const status = statusConfig[tender.status];
  const canBid = user?.role === 'contractor' && (tender.status === 'open' || tender.status === 'approved');
  const hasBid = bids.some(b => b.contractorId === user?.id);
  const isAwarded = tender.status === 'awarded';
  const isAwardedToCurrentUser = isAwarded && tender.awardedTo?.contractorId === user?.id;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{tender.title}</h1>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-6">
          {/* Show locked state for contractors who haven't paid EMD */}
          {canBid && !hasEMDPaid && !checkingEMD ? (
            <div className="py-12 text-center space-y-4">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">EMD Payment Required</h3>
                <p className="text-muted-foreground mb-4">
                  To view complete tender details and submit your bid, please pay the Earnest Money Deposit.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg inline-block mb-4">
                  <p className="text-sm text-muted-foreground">EMD Amount (Refundable)</p>
                  <p className="text-3xl font-bold text-primary">₹{tender.emdAmount.toLocaleString()}</p>
                </div>
              </div>
              <Button onClick={() => setShowEMDModal(true)} size="lg">
                <IndianRupee className="h-4 w-4 mr-2" />
                Pay EMD & Continue
              </Button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground">{tender.description}</p>
              </div>

              {tender.requirements && (
                <div className="pt-6 border-t">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Requirements</h2>
                  <p className="text-muted-foreground">{tender.requirements}</p>
                </div>
              )}

              {isAwarded && tender.awardedTo && (
                <div className="pt-6 border-t">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Award Status</h2>
                  <div className={`p-4 rounded-lg ${isAwardedToCurrentUser ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted/50'}`}>
                    {isAwardedToCurrentUser ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-semibold text-lg">🎉 Congratulations! This tender has been awarded to you.</p>
                        <p className="text-foreground">Awarded Amount: <span className="font-bold">₹{tender.awardedTo.amount.toLocaleString()}</span></p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-muted-foreground font-medium">This tender has been awarded to:</p>
                        <p className="text-foreground font-semibold">{tender.awardedTo.contractorName}</p>
                        <p className="text-sm text-muted-foreground">Amount: ₹{tender.awardedTo.amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {tender.status === 'pending_approval' && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-3">Approval Status</h2>
              <div className="flex gap-3 flex-wrap">
                <Badge variant={tender.approvals.dean && typeof tender.approvals.dean !== 'boolean' ? "default" : "secondary"}>
                  Dean {tender.approvals.dean && typeof tender.approvals.dean !== 'boolean' ? '✓' : '○'}
                </Badge>
                <Badge variant={tender.approvals.director && typeof tender.approvals.director !== 'boolean' ? "default" : "secondary"}>
                  Director {tender.approvals.director && typeof tender.approvals.director !== 'boolean' ? '✓' : '○'}
                </Badge>
                <Badge variant={tender.approvals.registrar && typeof tender.approvals.registrar !== 'boolean' ? "default" : "secondary"}>
                  Registrar {tender.approvals.registrar && typeof tender.approvals.registrar !== 'boolean' ? '✓' : '○'}
                </Badge>
              </div>

              {/* Show approval details if available */}
              {(tender.approvals.dean && typeof tender.approvals.dean !== 'boolean') && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs">
                  <p className="font-medium text-foreground">Dean Approval ID: {tender.approvals.dean.approvalId}</p>
                  <p className="text-muted-foreground">Approved by: {tender.approvals.dean.approvedBy}</p>
                </div>
              )}
              {(tender.approvals.director && typeof tender.approvals.director !== 'boolean') && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs">
                  <p className="font-medium text-foreground">Director Approval ID: {tender.approvals.director.approvalId}</p>
                  <p className="text-muted-foreground">Approved by: {tender.approvals.director.approvedBy}</p>
                </div>
              )}
              {(tender.approvals.registrar && typeof tender.approvals.registrar !== 'boolean') && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs">
                  <p className="font-medium text-foreground">Registrar Approval ID: {tender.approvals.registrar.approvalId}</p>
                  <p className="text-muted-foreground">Approved by: {tender.approvals.registrar.approvedBy}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Tender Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{tender.department}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{tender.coordinatorName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <p>Start: {new Date(tender.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(tender.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {canBid && hasEMDPaid && !isAwarded && (
            <Card className="p-6">
              {hasBid ? (
                <div className="text-center">
                  <Gavel className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">You have already submitted a bid</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => navigate('/my-bids')}
                  >
                    View My Bids
                  </Button>
                </div>
              ) : !showBidForm ? (
                <Button className="w-full" onClick={() => setShowBidForm(true)}>
                  <Gavel className="h-4 w-4 mr-2" />
                  Submit Bid
                </Button>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Quotation Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter your quotation amount"
                      value={bidForm.amount}
                      onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completionTime">Expected Completion Time *</Label>
                    <Input
                      id="completionTime"
                      placeholder="e.g., 90 days, 3 months"
                      value={bidForm.completionTime}
                      onChange={(e) => setBidForm({ ...bidForm, completionTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Comments/Remarks</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Additional notes or special conditions (optional)"
                      rows={3}
                      value={bidForm.remarks}
                      onChange={(e) => setBidForm({ ...bidForm, remarks: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Submit Bid</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowBidForm(false);
                        setBidForm({ amount: '', completionTime: '', remarks: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {isAwarded && isAwardedToCurrentUser && (
            <Card className="p-6 bg-green-500/5 border-green-500/20">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">🏆 You Won This Tender!</h3>
                <p className="text-sm text-muted-foreground">
                  Congratulations! You have been awarded this tender.
                </p>
                <p className="text-lg font-bold text-primary">
                  Contract Amount: ₹{tender.awardedTo?.amount.toLocaleString()}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {bids.length > 0 && (user?.role !== 'contractor') && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Bids Received ({bids.length})
          </h2>
          <div className="space-y-3">
            {bids.map(bid => (
              <div 
                key={bid.id} 
                className={`p-4 rounded-lg border ${bid.isLowest ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{bid.contractorName}</p>
                      {bid.isLowest && (
                        <Badge variant="default" className="bg-green-600">Lowest Bid</Badge>
                      )}
                      {bid.isAwarded && (
                        <Badge variant="default" className="bg-blue-600">Awarded</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completion Time: {bid.expectedCompletionTime}
                    </p>
                    {bid.remarks && (
                      <p className="text-sm text-muted-foreground mt-2">{bid.remarks}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{bid.quotationAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* EMD Payment Modal */}
      {tender && (
        <EMDPaymentModal
          open={showEMDModal}
          onClose={() => setShowEMDModal(false)}
          onSuccess={handleEMDPaymentSuccess}
          tenderTitle={tender.title}
          emdAmount={tender.emdAmount}
        />
      )}
    </div>
  );
};

export default TenderDetails;
