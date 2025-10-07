import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { FileText, Clock, CheckCircle } from 'lucide-react';

const DirectorDashboard = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      setTenders(allTenders);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTenders = tenders.filter(t => t.status === 'pending_approval' && !t.approvals.director);
  const approvedCount = tenders.filter(t => t.approvals.director).length;

  const stats = [
    {
      label: 'Pending Review',
      value: pendingTenders.length,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Approved by Me',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Total Tenders',
      value: tenders.length,
      icon: FileText,
      color: 'text-primary',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Director Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review and approve tender requests</p>
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

      {/* Pending Approvals */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Pending Approvals</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : pendingTenders.length === 0 ? (
          <div className="bg-card p-12 rounded-lg border text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingTenders.map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
