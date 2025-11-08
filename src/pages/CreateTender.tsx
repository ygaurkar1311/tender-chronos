import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const CreateTender = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    startDate: '',
    endDate: '',
    emdAmount: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfError('');

    if (!file) {
      setPdfFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are allowed');
      setPdfFile(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File size must be less than 5MB');
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.emdAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.emdAmount) <= 0) {
      toast.error('EMD amount must be greater than 0');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      // Convert PDF to base64 for storage (in real app, upload to server)
      let pdfData = '';
      let pdfFileName = '';
      if (pdfFile) {
        const reader = new FileReader();
        pdfData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(pdfFile);
        });
        pdfFileName = pdfFile.name;
      }

      await api.createTender({
        ...formData,
        emdAmount: parseFloat(formData.emdAmount),
        department: user?.department || '',
        coordinatorId: user?.id || '',
        coordinatorName: user?.username || '',
        status: 'pending_approval',
        pdfFile: pdfData,
        pdfFileName: pdfFileName,
        approvals: {
          dean: false,
          director: false,
          registrar: false,
        },
      });
      toast.success('Tender created successfully and sent for approval!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create tender');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Tender</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tender Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Computer Lab Equipment Purchase"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of the tender"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List specific requirements and specifications"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emdAmount">EMD Amount (₹) *</Label>
            <Input
              id="emdAmount"
              type="number"
              placeholder="Enter Earnest Money Deposit amount"
              value={formData.emdAmount}
              onChange={(e) => setFormData({ ...formData, emdAmount: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is a refundable security deposit that contractors must pay to view tender details and submit bids.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfFile">Tender Document (PDF)</Label>
            <Input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {pdfError && (
              <p className="text-xs text-destructive">{pdfError}</p>
            )}
            {pdfFile && (
              <p className="text-xs text-success">✓ {pdfFile.name} selected</p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a PDF document (max 5MB). This will be viewable by approvers.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Tender'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTender;
