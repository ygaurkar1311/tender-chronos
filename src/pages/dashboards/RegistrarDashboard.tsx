import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Clock, CheckCircle, XCircle, Building, Calendar, User, Eye } from 'lucide-react';
import ApprovalModal, { ApprovalData } from '@/components/ApprovalModal';
import RejectionModal from '@/components/RejectionModal';
import PDFViewerModal from '@/components/PDFViewerModal';
import { useNavigate } from 'react-router-dom';

const RegistrarDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

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

  const pendingTenders = tenders.filter(
    t => t.status === 'pending_approval' && 
    (t.approvals.registrar === false || typeof t.approvals.registrar === 'boolean')
  );
  const approvedCount = tenders.filter(t => t.approvals.registrar && typeof t.approvals.registrar !== 'boolean').length;

  const handleApprovalClick = (tender: Tender, action: 'approve' | 'reject') => {
    setSelectedTender(tender);
    setApprovalAction(action);
    if (action === 'approve') {
      setShowApprovalModal(true);
    } else {
      setShowRejectionModal(true);
    }
  };

  const handlePDFView = (tender: Tender) => {
    setSelectedTender(tender);
    setShowPDFModal(true);
  };

  const handleApprovalConfirm = async (approvalData: ApprovalData) => {
    if (!selectedTender || !user) return;

    try {
      if (approvalAction === 'approve') {
        await api.approveTender(selectedTender.id, 'registrar', {
          ...approvalData,
          approvedBy: user.username,
          approverEmail: user.email,
        });
        toast.success('Tender approved successfully', {
          description: `Approval ID: ${approvalData.approvalId}`,
        });
      }
      loadTenders();
    } catch (error) {
      toast.error('Failed to approve tender');
    }
  };

  const handleRejectionConfirm = async (rejectionData: { approvalId: string; timestamp: string; remarks: string }) => {
    if (!selectedTender || !user) return;

    try {
      await api.rejectTender(selectedTender.id, 'registrar', {
        ...rejectionData,
        rejectedBy: user.username,
        rejectorEmail: user.email,
      });
      toast.error('Tender rejected with remarks', {
        description: `Rejection ID: ${rejectionData.approvalId}`,
      });
      loadTenders();
    } catch (error) {
      toast.error('Failed to reject tender');
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground">Registrar Dashboard</h1>
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
              <Card key={tender.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {tender.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tender.description}</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
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
                      onClick={() => navigate(`/tender/${tender.id}`)}
                    >
                      View Details
                    </Button>
                    {tender.pdfFile && (
                      <Button 
                        variant="outline"
                        onClick={() => handlePDFView(tender)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    )}
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleApprovalClick(tender, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleApprovalClick(tender, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedTender && user && (
        <>
          <ApprovalModal
            isOpen={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            onConfirm={handleApprovalConfirm}
            tenderTitle={selectedTender.title}
            tenderId={selectedTender.id}
            userEmail={user.email}
            userName={user.username}
            action="approve"
          />
          <RejectionModal
            isOpen={showRejectionModal}
            onClose={() => setShowRejectionModal(false)}
            onConfirm={handleRejectionConfirm}
            tenderTitle={selectedTender.title}
            tenderId={selectedTender.id}
            userEmail={user.email}
            userName={user.username}
          />
          <PDFViewerModal
            isOpen={showPDFModal}
            onClose={() => setShowPDFModal(false)}
            pdfFile={selectedTender.pdfFile}
            fileName={selectedTender.pdfFileName}
          />
        </>
      )}
    </div>
  );
};

export default RegistrarDashboard;
