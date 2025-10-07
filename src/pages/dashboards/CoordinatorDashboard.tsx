import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';

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
            {tenders.map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
