import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender, Bid } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { FileText, Gavel, Award } from 'lucide-react';

const ContractorDashboard = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTenders, allBids] = await Promise.all([
        api.getTenders(),
        api.getBids(),
      ]);
      
      const openTenders = allTenders.filter(t => t.status === 'open');
      const myBids = allBids.filter(b => b.contractorId === user?.id);
      
      setTenders(openTenders);
      setBids(myBids);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardedBids = bids.filter(b => b.isAwarded).length;

  const stats = [
    {
      label: 'Open Tenders',
      value: tenders.length,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'My Bids',
      value: bids.length,
      icon: Gavel,
      color: 'text-warning',
    },
    {
      label: 'Awarded',
      value: awardedBids,
      icon: Award,
      color: 'text-success',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contractor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.username}
        </p>
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

      {/* Open Tenders */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Open Tenders</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : tenders.length === 0 ? (
          <div className="bg-card p-12 rounded-lg border text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No open tenders available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tenders.slice(0, 3).map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
