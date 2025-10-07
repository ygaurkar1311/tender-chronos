import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { FileText } from 'lucide-react';

const OpenTenders = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpenTenders();
  }, []);

  const loadOpenTenders = async () => {
    try {
      const allTenders = await api.getTenders();
      const open = allTenders.filter(t => t.status === 'open');
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
        <p className="text-muted-foreground mt-1">Browse and bid on available tenders</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tenders.length === 0 ? (
        <div className="bg-card p-12 rounded-lg border text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No open tenders available at the moment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tenders.map(tender => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenTenders;
