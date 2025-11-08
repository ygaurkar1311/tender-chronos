import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      // Filter tenders created by this coordinator
      const myTenders = allTenders.filter(t => t.coordinatorId === user?.id);
      setTenders(myTenders);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Tenders',
      value: tenders.length,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Pending Approval',
      value: tenders.filter(t => t.status === 'pending_approval').length,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Active Tenders',
      value: tenders.filter(t => t.status === 'open').length,
      icon: CheckCircle,
      color: 'text-success',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.username} • {user?.department}
          </p>
        </div>
        <Button onClick={() => navigate('/create-tender')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Tender
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tenders */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">My Tenders</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : tenders.length === 0 ? (
          <div className="bg-card p-12 rounded-lg border text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tenders created yet</p>
            <Button onClick={() => navigate('/create-tender')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Tender
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tenders.map(tender => {
              const hasRejections = tender.rejections && 
                (tender.rejections.dean || tender.rejections.director || tender.rejections.registrar);
              const isRejected = tender.status === 'draft' && hasRejections;

              return (
                <Card key={tender.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {tender.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tender.description}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          tender.status === 'open' || tender.status === 'approved' ? 'default' :
                          tender.status === 'pending_approval' ? 'secondary' :
                          isRejected ? 'destructive' : 'outline'
                        }
                      >
                        {tender.status === 'draft' && isRejected ? '❌ Rejected' :
                         tender.status === 'pending_approval' ? '🟡 Pending Approval' :
                         tender.status === 'approved' ? '✅ Approved' :
                         tender.status === 'open' ? '✅ Open' :
                         tender.status === 'awarded' ? '🎉 Awarded' :
                         tender.status}
                      </Badge>
                    </div>

                    {isRejected && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-destructive font-semibold">
                          <AlertCircle className="h-5 w-5" />
                          <span>Rejection Remarks</span>
                        </div>
                        {tender.rejections?.director && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Director:</p>
                            <p className="text-sm text-muted-foreground pl-4">
                              {tender.rejections.director.remarks}
                            </p>
                          </div>
                        )}
                        {tender.rejections?.dean && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Dean (Procurement):</p>
                            <p className="text-sm text-muted-foreground pl-4">
                              {tender.rejections.dean.remarks}
                            </p>
                          </div>
                        )}
                        {tender.rejections?.registrar && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Registrar:</p>
                            <p className="text-sm text-muted-foreground pl-4">
                              {tender.rejections.registrar.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Approvals:</span>
                      <div className="flex gap-2">
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
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/tender/${tender.id}`)}
                      >
                        View Details
                      </Button>
                      {isRejected && (
                        <Button 
                          variant="default"
                          className="flex-1"
                          onClick={() => navigate(`/create-tender?edit=${tender.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit & Resubmit
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
