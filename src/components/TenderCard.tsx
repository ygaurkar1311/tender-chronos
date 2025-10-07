import { Tender } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building, User } from 'lucide-react';

interface TenderCardProps {
  tender: Tender;
  showActions?: boolean;
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const },
  pending_approval: { label: 'Pending Approval', variant: 'default' as const },
  approved: { label: 'Approved', variant: 'default' as const },
  open: { label: 'Open for Bids', variant: 'default' as const },
  closed: { label: 'Closed', variant: 'secondary' as const },
  awarded: { label: 'Awarded', variant: 'default' as const },
};

const TenderCard = ({ tender, showActions = true }: TenderCardProps) => {
  const navigate = useNavigate();
  const status = statusConfig[tender.status];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{tender.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{tender.description}</p>
          </div>
          <Badge variant={status.variant} className="ml-4">
            {status.label}
          </Badge>
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

        {tender.status === 'pending_approval' && (
          <div className="flex gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Approvals:</span>
            <div className="flex gap-2">
              <Badge variant={tender.approvals.dean ? "default" : "secondary"} className="text-xs">
                Dean {tender.approvals.dean ? '✓' : '○'}
              </Badge>
              <Badge variant={tender.approvals.director ? "default" : "secondary"} className="text-xs">
                Director {tender.approvals.director ? '✓' : '○'}
              </Badge>
              <Badge variant={tender.approvals.registrar ? "default" : "secondary"} className="text-xs">
                Registrar {tender.approvals.registrar ? '✓' : '○'}
              </Badge>
            </div>
          </div>
        )}

        {showActions && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/tender/${tender.id}`)}
            >
              View Details
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TenderCard;
