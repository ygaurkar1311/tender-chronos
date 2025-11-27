import { Tender, Bid, TenderStatus, EMDPayment } from './mockData';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions - Replace with actual Axios calls to backend
export const api = {
  // Tender APIs
  getTenders: async (): Promise<Tender[]> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    return stored ? JSON.parse(stored) : [];
  },

  getTenderById: async (id: string): Promise<Tender | null> => {
    await delay(300);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    return tenders.find(t => t.id === id) || null;
  },

  createTender: async (tender: Omit<Tender, 'id' | 'createdAt'>): Promise<Tender> => {
    await delay(500);
    const newTender: Tender = {
      ...tender,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    tenders.push(newTender);
    localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    
    return newTender;
  },

  updateTender: async (id: string, updates: Partial<Tender>): Promise<Tender> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const index = tenders.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Tender not found');
    
    tenders[index] = { ...tenders[index], ...updates };
    localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    
    return tenders[index];
  },

  deleteTender: async (id: string): Promise<void> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const filtered = tenders.filter(t => t.id !== id);
    localStorage.setItem('tms_tenders', JSON.stringify(filtered));
  },

  approveTender: async (
    id: string, 
    role: 'dean' | 'director' | 'registrar',
    approvalData: {
      approvalId: string;
      otp: string;
      digitalSignature: string;
      timestamp: string;
      approvedBy: string;
      approverEmail: string;
    }
  ): Promise<Tender> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const tender = tenders.find(t => t.id === id);
    
    if (!tender) throw new Error('Tender not found');
    
    // Sequential approval check: Registrar → Dean → Director
    const isRegistrarApproved = tender.approvals.registrar && typeof tender.approvals.registrar !== 'boolean';
    const isDeanApproved = tender.approvals.dean && typeof tender.approvals.dean !== 'boolean';

    // Dean can only approve after Registrar has approved
    if (role === 'dean' && !isRegistrarApproved) {
      throw new Error('Registrar must approve first');
    }
    
    // Director can only approve after both Registrar and Dean have approved
    if (role === 'director' && (!isRegistrarApproved || !isDeanApproved)) {
      throw new Error('Registrar and Dean must approve first');
    }
    
    tender.approvals[role] = approvalData;
    
    // Check if all approvals are complete
    const allApproved = 
      tender.approvals.dean && typeof tender.approvals.dean !== 'boolean' &&
      tender.approvals.director && typeof tender.approvals.director !== 'boolean' &&
      tender.approvals.registrar && typeof tender.approvals.registrar !== 'boolean';
    
    if (allApproved) {
      tender.status = 'approved';
    }
    
    localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    return tender;
  },

  rejectTender: async (
    id: string,
    role: 'dean' | 'director' | 'registrar',
    rejectionData: {
      approvalId: string;
      timestamp: string;
      rejectedBy: string;
      rejectorEmail: string;
      remarks: string;
    }
  ): Promise<Tender> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const tender = tenders.find(t => t.id === id);
    
    if (!tender) throw new Error('Tender not found');
    
    tender.approvals[role] = false;
    tender.status = 'rejected'; // Set status to rejected
    
    // Store rejection remarks
    if (!tender.rejections) tender.rejections = {};
    tender.rejections[role] = {
      rejectionId: rejectionData.approvalId,
      timestamp: rejectionData.timestamp,
      rejectedBy: rejectionData.rejectedBy,
      rejectorEmail: rejectionData.rejectorEmail,
      remarks: rejectionData.remarks,
    };
    
    localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    return tender;
  },

  // Bid APIs
  getBids: async (tenderId?: string): Promise<Bid[]> => {
    await delay(500);
    const stored = localStorage.getItem('tms_bids');
    const allBids: Bid[] = stored ? JSON.parse(stored) : [];
    return tenderId ? allBids.filter(b => b.tenderId === tenderId) : allBids;
  },

  submitBid: async (bid: Omit<Bid, 'id' | 'submittedAt'>): Promise<Bid> => {
    await delay(500);
    const newBid: Bid = {
      ...bid,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
    };
    
    const stored = localStorage.getItem('tms_bids');
    const bids: Bid[] = stored ? JSON.parse(stored) : [];
    bids.push(newBid);
    
    // Auto-evaluate lowest bid
    const tenderBids = bids.filter(b => b.tenderId === bid.tenderId);
    const lowestBid = tenderBids.reduce((prev, current) => 
      current.quotationAmount < prev.quotationAmount ? current : prev
    );
    
    // Mark all bids as not lowest first
    tenderBids.forEach(b => b.isLowest = false);
    // Mark the lowest bid
    const lowestBidIndex = bids.findIndex(b => b.id === lowestBid.id);
    if (lowestBidIndex !== -1) {
      bids[lowestBidIndex].isLowest = true;
    }
    
    localStorage.setItem('tms_bids', JSON.stringify(bids));
    
    return newBid;
  },

  awardTender: async (tenderId: string, bidId: string): Promise<void> => {
    await delay(500);
    
    // Update bid
    const storedBids = localStorage.getItem('tms_bids');
    const bids: Bid[] = storedBids ? JSON.parse(storedBids) : [];
    const bid = bids.find(b => b.id === bidId);
    if (bid) {
      bid.isAwarded = true;
      localStorage.setItem('tms_bids', JSON.stringify(bids));
    }
    
    // Update tender
    const storedTenders = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = storedTenders ? JSON.parse(storedTenders) : [];
    const tender = tenders.find(t => t.id === tenderId);
    if (tender && bid) {
      tender.status = 'awarded';
      tender.awardedTo = {
        contractorId: bid.contractorId,
        contractorName: bid.contractorName,
        amount: bid.quotationAmount,
        bidId: bid.id,
      };
      localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    }
  },

  // EMD Payment APIs
  getEMDPayments: async (contractorId?: string): Promise<EMDPayment[]> => {
    await delay(300);
    const stored = localStorage.getItem('tms_emd_payments');
    const allPayments: EMDPayment[] = stored ? JSON.parse(stored) : [];
    return contractorId ? allPayments.filter(p => p.contractorId === contractorId) : allPayments;
  },

  hasEMDPayment: async (tenderId: string, contractorId: string): Promise<boolean> => {
    await delay(200);
    const stored = localStorage.getItem('tms_emd_payments');
    const payments: EMDPayment[] = stored ? JSON.parse(stored) : [];
    return payments.some(p => p.tenderId === tenderId && p.contractorId === contractorId && p.status === 'success');
  },

  processEMDPayment: async (payment: Omit<EMDPayment, 'id' | 'paymentDate' | 'status'>): Promise<EMDPayment> => {
    await delay(1000); // Simulate payment processing
    const newPayment: EMDPayment = {
      ...payment,
      id: Date.now().toString(),
      paymentDate: new Date().toISOString(),
      status: 'success',
    };
    
    const stored = localStorage.getItem('tms_emd_payments');
    const payments: EMDPayment[] = stored ? JSON.parse(stored) : [];
    payments.push(newPayment);
    localStorage.setItem('tms_emd_payments', JSON.stringify(payments));
    
    return newPayment;
  },
};
