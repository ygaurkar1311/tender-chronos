import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Building, Calendar, User, Eye } from 'lucide-react';
import ApprovalModal, { ApprovalData } from '@/components/ApprovalModal';
import RejectionModal from '@/components/RejectionModal';
import PDFViewerModal from '@/components/PDFViewerModal';

const Approvals = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

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
      const roleKey = user.role as 'dean' | 'director' | 'registrar';
      await api.approveTender(selectedTender.id, roleKey, {
        ...approvalData,
        approvedBy: user.username,
        approverEmail: user.email,
      });
      toast.success('Tender approved successfully', {
        description: `Approval ID: ${approvalData.approvalId}`,
      });
      loadPendingTenders();
    } catch (error: any) {
      toast.error('Failed to approve tender', {
        description: error.message || 'An error occurred',
      });
    }
  };

  const handleRejectionConfirm = async (rejectionData: { approvalId: string; timestamp: string; remarks: string }) => {
    if (!selectedTender || !user) return;

    try {
      const roleKey = user.role as 'dean' | 'director' | 'registrar';
      await api.rejectTender(selectedTender.id, roleKey, {
        ...rejectionData,
        rejectedBy: user.username,
        rejectorEmail: user.email,
      });
      toast.error('Tender rejected with remarks', {
        description: `Rejection ID: ${rejectionData.approvalId}`,
      });
      loadPendingTenders();
    } catch (error) {
      toast.error('Failed to reject tender');
    }
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

                  {alreadyApproved !== undefined && typeof alreadyApproved !== 'boolean' ? (
                    <div className="pt-4 border-t">
                      <Badge variant="default">
                        Approved by you
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Approval ID: {alreadyApproved.approvalId}
                      </p>
                    </div>
                  ) : alreadyApproved === false ? (
                    <div className="pt-4 border-t">
                      <Badge variant="destructive">
                        Rejected by you
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-4 border-t">
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
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

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

export default Approvals;
