export type TenderStatus = 'draft' | 'pending_approval' | 'approved' | 'open' | 'closed' | 'awarded';

export interface ApprovalRecord {
  approvalId: string;
  otp: string;
  digitalSignature: string;
  timestamp: string;
  approvedBy: string;
  approverEmail: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  requirements: string;
  startDate: string;
  endDate: string;
  department: string;
  coordinatorId: string;
  coordinatorName: string;
  status: TenderStatus;
  emdAmount: number;
  approvals: {
    dean: boolean | ApprovalRecord;
    director: boolean | ApprovalRecord;
    registrar: boolean | ApprovalRecord;
  };
  awardedTo?: {
    contractorId: string;
    contractorName: string;
    amount: number;
    bidId: string;
  };
  createdAt: string;
}

export interface Bid {
  id: string;
  tenderId: string;
  contractorId: string;
  contractorName: string;
  quotationAmount: number;
  expectedCompletionTime: string;
  remarks: string;
  document?: string;
  submittedAt: string;
  isLowest?: boolean;
  isAwarded?: boolean;
}

export interface EMDPayment {
  id: string;
  tenderId: string;
  contractorId: string;
  amount: number;
  paymentDate: string;
  status: 'success' | 'pending' | 'failed';
}

export const mockTenders: Tender[] = [
  {
    id: '1',
    title: 'Computer Lab Equipment Procurement',
    description: 'Purchase of 50 desktop computers and peripherals for new computer lab',
    requirements: '50x Intel i7 computers, 50x monitors, keyboards, mice',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    department: 'Computer Science',
    coordinatorId: '1',
    coordinatorName: 'Dr. Rajesh Kumar',
    status: 'open',
    emdAmount: 50000,
    approvals: {
      dean: true,
      director: true,
      registrar: true,
    },
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    title: 'Library Building Renovation',
    description: 'Complete renovation of the central library building',
    requirements: 'Painting, electrical work, furniture replacement',
    startDate: '2025-02-01',
    endDate: '2025-03-01',
    department: 'Civil Engineering',
    coordinatorId: '2',
    coordinatorName: 'Prof. Amit Sharma',
    status: 'pending_approval',
    emdAmount: 100000,
    approvals: {
      dean: true,
      director: false,
      registrar: false,
    },
    createdAt: '2025-01-20',
  },
  {
    id: '3',
    title: 'Laboratory Chemical Supplies',
    description: 'Annual procurement of chemistry lab chemicals and equipment',
    requirements: 'Various chemicals, glassware, safety equipment',
    startDate: '2025-01-20',
    endDate: '2025-02-20',
    department: 'Chemistry',
    coordinatorId: '3',
    coordinatorName: 'Dr. Priya Singh',
    status: 'approved',
    emdAmount: 25000,
    approvals: {
      dean: true,
      director: true,
      registrar: true,
    },
    createdAt: '2025-01-15',
  },
];

export const mockBids: Bid[] = [
  {
    id: '1',
    tenderId: '1',
    contractorId: 'c1',
    contractorName: 'Tech Solutions Ltd.',
    quotationAmount: 2500000,
    expectedCompletionTime: '90 days',
    remarks: 'High-quality Dell computers with 3-year warranty',
    submittedAt: '2025-01-18',
    isLowest: true,
  },
  {
    id: '2',
    tenderId: '1',
    contractorId: 'c2',
    contractorName: 'Digital Enterprises',
    quotationAmount: 2800000,
    expectedCompletionTime: '75 days',
    remarks: 'HP computers with extended support',
    submittedAt: '2025-01-19',
  },
  {
    id: '3',
    tenderId: '1',
    contractorId: 'c3',
    contractorName: 'ComputerWorld Inc.',
    quotationAmount: 2650000,
    expectedCompletionTime: '85 days',
    remarks: 'Lenovo systems with premium service',
    submittedAt: '2025-01-20',
  },
];
