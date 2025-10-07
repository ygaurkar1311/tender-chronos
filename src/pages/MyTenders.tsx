import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyTenders = () => {
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
      const myTenders = allTenders.filter(t => t.coordinatorId === user?.id);
      setTenders(myTenders);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: string[]) => 
    tenders.filter(t => status.includes(t.status));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tenders</h1>
          <p className="text-muted-foreground mt-1">Manage all your tenders</p>
        </div>
        <Button onClick={() => navigate('/create-tender')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Tender
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({tenders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filterByStatus(['pending_approval']).length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({filterByStatus(['open']).length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({filterByStatus(['closed', 'awarded']).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
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
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filterByStatus(['pending_approval']).map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filterByStatus(['open']).map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filterByStatus(['closed', 'awarded']).map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTenders;
