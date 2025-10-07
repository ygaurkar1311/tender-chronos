import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Building, Calendar, User } from 'lucide-react';

const Approvals = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingTenders();
  }, []);

  const loadPendingTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      const pending = allTenders.filter(t => t.status === 'pending_approval');
      setTenders(pending);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tenderId: string) => {
    try {
      const roleKey = user?.role as 'dean' | 'director' | 'registrar';
      await api.approveTender(tenderId, roleKey);
      toast.success('Tender approved successfully');
      loadPendingTenders();
    } catch (error) {
      toast.error('Failed to approve tender');
    }
  };

  const handleReject = async (tenderId: string) => {
    toast.info('Rejection feature coming soon');
  };

  const getApprovalStatus = (tender: Tender) => {
    const roleKey = user?.role as 'dean' | 'director' | 'registrar';
    return tender.approvals[roleKey];
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve tenders</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tenders.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending approvals</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tenders.map(tender => {
            const alreadyApproved = getApprovalStatus(tender);
            
            return (
              <Card key={tender.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {tender.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tender.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
                      <span>Ends: {new Date(tender.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Approvals:</span>
                    <div className="flex gap-2">
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

                  {alreadyApproved !== undefined ? (
                    <div className="pt-4 border-t">
                      <Badge variant={alreadyApproved ? "default" : "destructive"}>
                        {alreadyApproved ? 'Approved by you' : 'Rejected by you'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => handleApprove(tender.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleReject(tender.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Approvals;
