import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Award, Building, Calendar } from 'lucide-react';

const Awards = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAwardedTenders();
  }, []);

  const loadAwardedTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      const awarded = allTenders.filter(t => t.status === 'awarded');
      setTenders(awarded);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Awarded Tenders</h1>
        <p className="text-muted-foreground mt-1">View all completed tender awards</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tenders.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No awarded tenders yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tenders.map(tender => (
            <Card key={tender.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {tender.title}
                      </h3>
                      <Badge className="bg-success text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Awarded
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tender.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{tender.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ended: {new Date(tender.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/tender/${tender.id}`)}
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

export default Awards;
