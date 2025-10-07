import { Tender, Bid, TenderStatus } from './mockData';

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

  approveTender: async (id: string, role: 'dean' | 'director' | 'registrar'): Promise<Tender> => {
    await delay(500);
    const stored = localStorage.getItem('tms_tenders');
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const tender = tenders.find(t => t.id === id);
    
    if (!tender) throw new Error('Tender not found');
    
    tender.approvals[role] = true;
    
    // Check if all approvals are complete
    if (tender.approvals.dean && tender.approvals.director && tender.approvals.registrar) {
      tender.status = 'approved';
    }
    
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
    if (tender) {
      tender.status = 'awarded';
      localStorage.setItem('tms_tenders', JSON.stringify(tenders));
    }
  },
};
