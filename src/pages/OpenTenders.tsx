import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building, IndianRupee } from 'lucide-react';

const OpenTenders = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOpenTenders();
  }, []);

  const loadOpenTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      const open = allTenders.filter(t => t.status === 'open' || t.status === 'approved');
      setTenders(open);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Open Tenders</h1>
        <p className="text-muted-foreground mt-1">Browse and bid on available approved tenders</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tenders.length === 0 ? (
        <div className="bg-card p-12 rounded-lg border text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No open tenders available at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map(tender => (
            <Card key={tender.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{tender.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{tender.department}</span>
                      </div>
                    </div>
                    <Badge variant={tender.status === 'open' ? 'default' : 'secondary'}>
                      {tender.status === 'open' ? 'Open for Bids' : 'Approved'}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground line-clamp-2">{tender.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(tender.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-destructive" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(tender.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">EMD Amount</p>
                        <p className="font-medium text-foreground">
                          ₹{(tender.emdAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button 
                    onClick={() => navigate(`/tender/${tender.id}`)}
                    className="w-full md:w-auto"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenTenders;
