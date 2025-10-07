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
import { toast } from 'sonner';
import { ArrowLeft, Building, Calendar, User, Gavel } from 'lucide-react';

const TenderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tender, setTender] = useState<Tender | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({
    amount: '',
    remarks: '',
  });

  useEffect(() => {
    loadTenderDetails();
  }, [id]);

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

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidForm.amount || parseFloat(bidForm.amount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      await api.submitBid({
        tenderId: id!,
        contractorId: user!.id,
        contractorName: user!.username,
        quotationAmount: parseFloat(bidForm.amount),
        remarks: bidForm.remarks,
      });
      toast.success('Bid submitted successfully');
      setShowBidForm(false);
      setBidForm({ amount: '', remarks: '' });
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
  const canBid = user?.role === 'contractor' && tender.status === 'open';
  const hasBid = bids.some(b => b.contractorId === user?.id);

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

          {tender.status === 'pending_approval' && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-3">Approval Status</h2>
              <div className="flex gap-3">
                <Badge variant={tender.approvals.dean ? "default" : "secondary"}>
                  Dean {tender.approvals.dean ? '✓' : '○'}
                </Badge>
                <Badge variant={tender.approvals.director ? "default" : "secondary"}>
                  Director {tender.approvals.director ? '✓' : '○'}
                </Badge>
                <Badge variant={tender.approvals.registrar ? "default" : "secondary"}>
                  Registrar {tender.approvals.registrar ? '✓' : '○'}
                </Badge>
              </div>
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

          {canBid && (
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
                    <Label htmlFor="amount">Bid Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={bidForm.amount}
                      onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Additional notes (optional)"
                      rows={3}
                      value={bidForm.remarks}
                      onChange={(e) => setBidForm({ ...bidForm, remarks: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Submit</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowBidForm(false);
                        setBidForm({ amount: '', remarks: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
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
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{bid.contractorName}</p>
                  {bid.remarks && (
                    <p className="text-sm text-muted-foreground mt-1">{bid.remarks}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    ₹{bid.quotationAmount.toLocaleString()}
                  </p>
                  {bid.isLowest && (
                    <Badge variant="default" className="mt-1">Lowest</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TenderDetails;
