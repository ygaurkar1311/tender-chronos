import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender, Bid } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trophy, Award, Building, IndianRupee } from 'lucide-react';

const Awards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Record<string, Bid[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAwardsData();
  }, [user]);

  const loadAwardsData = async () => {
    try {
      const allTenders = await api.getTenders();
      const allBids = await api.getBids();

      // For coordinators, show tenders with bids that can be awarded
      // For contractors, show awarded tenders
      let relevantTenders: Tender[] = [];
      
      if (user?.role === 'coordinator') {
        // Show tenders with bids that can be awarded
        const tendersWithBids = allTenders.filter(t => 
          t.coordinatorId === user.id && 
          (t.status === 'open' || t.status === 'closed' || t.status === 'awarded') &&
          allBids.some(b => b.tenderId === t.id)
        );
        relevantTenders = tendersWithBids;
      } else if (user?.role === 'contractor') {
        relevantTenders = allTenders.filter(t => t.status === 'awarded');
      } else {
        // For other roles, show all awarded tenders
        relevantTenders = allTenders.filter(t => t.status === 'awarded');
      }

      setTenders(relevantTenders);

      // Group bids by tender ID and mark lowest
      const bidsByTender: Record<string, Bid[]> = {};
      relevantTenders.forEach(tender => {
        const tenderBids = allBids.filter(b => b.tenderId === tender.id);
        if (tenderBids.length > 0) {
          // Sort by amount
          const sortedBids = tenderBids.sort((a, b) => 
            a.quotationAmount - b.quotationAmount
          );
          bidsByTender[tender.id] = sortedBids;
        }
      });
      setBids(bidsByTender);
    } catch (error) {
      console.error('Failed to load awards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardTender = async (tenderId: string, bidId: string) => {
    try {
      await api.awardTender(tenderId, bidId);
      toast.success('Tender awarded successfully to the lowest bidder');
      loadAwardsData();
    } catch (error) {
      toast.error('Failed to award tender');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tender Awards</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'coordinator' 
            ? 'Review bids and award tenders to the lowest bidder' 
            : 'View awarded tenders and winning bids'}
        </p>
      </div>

      {tenders.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {user?.role === 'coordinator' 
              ? 'No tenders with bids available for awarding' 
              : 'No awarded tenders found'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {tenders.map(tender => {
            const tenderBids = bids[tender.id] || [];
            const lowestBid = tenderBids.length > 0 ? tenderBids[0] : null;
            const isAwarded = tender.status === 'awarded';

            return (
              <Card key={tender.id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-foreground">{tender.title}</h3>
                      <Badge variant={isAwarded ? 'default' : 'secondary'}>
                        {isAwarded ? '✓ Awarded' : 'Pending Award'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {tender.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        EMD: ₹{tender.emdAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/tender/${tender.id}`)}
                  >
                    View Details
                  </Button>
                </div>

                {tenderBids.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        Bids Received ({tenderBids.length})
                      </h4>
                      {!isAwarded && lowestBid && user?.role === 'coordinator' && (
                        <p className="text-sm text-muted-foreground">
                          System will auto-award to lowest bidder
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {tenderBids.map((bid, index) => {
                        const isLowest = index === 0;
                        const isWinner = bid.isAwarded || (isAwarded && tender.awardedTo?.bidId === bid.id);

                        return (
                          <div 
                            key={bid.id}
                            className={`p-4 rounded-lg border transition-all ${
                              isWinner
                                ? 'bg-green-500/10 border-green-500/30 shadow-md'
                                : isLowest
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-muted/30 border-muted'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-foreground">{bid.contractorName}</p>
                                  {isLowest && !isWinner && (
                                    <Badge variant="default" className="bg-blue-600">
                                      Lowest Bid
                                    </Badge>
                                  )}
                                  {isWinner && (
                                    <Badge variant="default" className="bg-green-600">
                                      <Award className="h-3 w-3 mr-1" />
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Completion: {bid.expectedCompletionTime}
                                </p>
                                {bid.remarks && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    "{bid.remarks}"
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className={`text-2xl font-bold ${isWinner ? 'text-green-600' : 'text-primary'}`}>
                                  ₹{bid.quotationAmount.toLocaleString()}
                                </p>
                                {user?.role === 'coordinator' && !isAwarded && isLowest && (
                                  <Button 
                                    onClick={() => handleAwardTender(tender.id, bid.id)}
                                    size="sm"
                                    className="mt-2"
                                  >
                                    <Award className="h-4 w-4 mr-2" />
                                    Award Tender
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isAwarded && tender.awardedTo && (
                      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          ✓ Tender Awarded
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Winner: <span className="font-semibold text-foreground">{tender.awardedTo.contractorName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contract Amount: <span className="font-semibold text-green-600">₹{tender.awardedTo.amount.toLocaleString()}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bids have been submitted yet</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Awards;
