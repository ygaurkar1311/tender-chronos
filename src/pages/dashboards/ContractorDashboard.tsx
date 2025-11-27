import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender, Bid } from '@/utils/mockData';
import TenderCard from '@/components/TenderCard';
import { FileText, Gavel, Award, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ContractorDashboard = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTenders, allBids] = await Promise.all([
        api.getTenders(),
        api.getBids(),
      ]);
      
      const myBids = allBids.filter(b => b.contractorId === user?.id);
      
      setTenders(allTenders);
      setBids(myBids);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTenders = () => {
    switch (statusFilter) {
      case 'approved':
        return tenders.filter(t => t.status === 'approved' || t.status === 'open');
      case 'rejected':
        return tenders.filter(t => t.status === 'rejected');
      case 'pending':
        return tenders.filter(t => t.status === 'pending_approval');
      default:
        return tenders;
    }
  };

  const getApprovalStatus = (tender: Tender) => {
    const approvals = tender.approvals;
    const rejections = tender.rejections || {};
    
    const getStatus = (approval: boolean | any) => {
      if (typeof approval === 'object' && approval?.approvedBy) return 'approved';
      if (approval === true) return 'approved';
      return 'pending';
    };
    
    return [
      { 
        role: 'Registrar', 
        status: getStatus(approvals.registrar), 
        remarks: rejections.registrar?.remarks 
      },
      { 
        role: 'Dean', 
        status: getStatus(approvals.dean), 
        remarks: rejections.dean?.remarks 
      },
      { 
        role: 'Director', 
        status: getStatus(approvals.director), 
        remarks: rejections.director?.remarks 
      },
    ];
  };

  const awardedBids = bids.filter(b => b.isAwarded).length;
  const approvedTenders = tenders.filter(t => t.status === 'approved' || t.status === 'open').length;
  const pendingTenders = tenders.filter(t => t.status === 'pending_approval').length;
  const rejectedTenders = tenders.filter(t => t.status === 'rejected').length;

  const stats = [
    {
      label: 'Approved Tenders',
      value: approvedTenders,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Pending Approval',
      value: pendingTenders,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Rejected',
      value: rejectedTenders,
      icon: XCircle,
      color: 'text-destructive',
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

      {/* Tenders List with Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">All Tenders</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenders</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : getFilteredTenders().length === 0 ? (
          <div className="bg-card p-12 rounded-lg border text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tenders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {getFilteredTenders().map(tender => (
              <Card key={tender.id} className="p-6">
                <TenderCard tender={tender} />
                
                {/* Approval Flow Status */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Approval Status</h4>
                  <div className="space-y-2">
                    {getApprovalStatus(tender).map((approval, index) => (
                      <div key={approval.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{approval.role}</span>
                          {approval.status === 'approved' && (
                            <Badge variant="default" className="bg-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {approval.status === 'rejected' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {approval.status === 'pending' && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        {approval.remarks && (
                          <p className="text-xs text-muted-foreground italic">"{approval.remarks}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
