import { useAuth } from '@/context/AuthContext';
import CoordinatorDashboard from './dashboards/CoordinatorDashboard';
import DeanDashboard from './dashboards/DeanDashboard';
import DirectorDashboard from './dashboards/DirectorDashboard';
import RegistrarDashboard from './dashboards/RegistrarDashboard';
import ContractorDashboard from './dashboards/ContractorDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'coordinator':
      return <CoordinatorDashboard />;
    case 'dean':
      return <DeanDashboard />;
    case 'director':
      return <DirectorDashboard />;
    case 'registrar':
      return <RegistrarDashboard />;
    case 'contractor':
      return <ContractorDashboard />;
    default:
      return null;
  }
};

export default Dashboard;
