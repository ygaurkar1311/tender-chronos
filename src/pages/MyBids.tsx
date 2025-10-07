import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Bid, Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Gavel, Award, FileText } from 'lucide-react';

const MyBids = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const [allBids, allTenders] = await Promise.all([
        api.getBids(),
        api.getTenders(),
      ]);
      const myBids = allBids.filter(b => b.contractorId === user?.id);
      setBids(myBids);
      setTenders(allTenders);
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTenderById = (tenderId: string) => 
    tenders.find(t => t.id === tenderId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
        <p className="text-muted-foreground mt-1">Track all your submitted bids</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : bids.length === 0 ? (
        <Card className="p-12 text-center">
          <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">You haven't submitted any bids yet</p>
          <Button onClick={() => navigate('/open-tenders')}>
            Browse Open Tenders
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bids.map(bid => {
            const tender = getTenderById(bid.tenderId);
            if (!tender) return null;

            return (
              <Card key={bid.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {tender.title}
                        </h3>
                        {bid.isLowest && !bid.isAwarded && (
                          <Badge variant="default">Lowest Bid</Badge>
                        )}
                        {bid.isAwarded && (
                          <Badge className="bg-success text-white">
                            <Award className="h-3 w-3 mr-1" />
                            Awarded
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tender.department}</p>
                    </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{bid.quotationAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Your bid</p>
                  </div>
                  </div>

                  {bid.remarks && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Remarks: </span>
                      <span className="text-foreground">{bid.remarks}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">
                      Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tender/${tender.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Tender
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;
