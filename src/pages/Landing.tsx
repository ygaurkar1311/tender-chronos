import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { GraduationCap, FileText, Users, Shield, TrendingUp } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: FileText,
      title: 'Digital Tender Management',
      description: 'Create, track, and manage tenders efficiently in a centralized system',
    },
    {
      icon: Users,
      title: 'Multi-Level Approval',
      description: 'Streamlined approval workflow with Dean, Director, and Registrar authorization',
    },
    {
      icon: Shield,
      title: 'Transparent Bidding',
      description: 'Fair and transparent bidding process with automated lowest bid detection',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Tracking',
      description: 'Monitor tender status and progress at every stage of the process',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Tender Management
            <span className="block text-primary mt-2">Made Simple</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive digital platform for managing college tenders, approvals, and contractor bidding - 
            bringing transparency and efficiency to procurement processes.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/register')} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-lg px-8">
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose TMS?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Who Can Use TMS?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Coordinators</h3>
                  <p className="text-sm text-muted-foreground">Create and manage department tenders</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Dean / Director / Registrar</h3>
                  <p className="text-sm text-muted-foreground">Review and approve tender requests</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Contractors</h3>
                <p className="text-sm text-muted-foreground">Browse open tenders and submit competitive bids</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 College Tender Management System. All rights reserved.</p>
            <p className="mt-2">Contact: tms@college.edu | +91-XXX-XXX-XXXX</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
