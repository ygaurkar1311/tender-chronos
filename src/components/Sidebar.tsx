import { useAuth, UserRole } from '@/context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Award, 
  FileCheck, 
  User,
  Plus,
  Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['coordinator', 'dean', 'director', 'registrar', 'contractor'],
  },
  {
    label: 'Create Tender',
    path: '/create-tender',
    icon: Plus,
    roles: ['coordinator'],
  },
  {
    label: 'My Tenders',
    path: '/my-tenders',
    icon: FileText,
    roles: ['coordinator'],
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: CheckSquare,
    roles: ['dean', 'director', 'registrar'],
  },
  {
    label: 'Open Tenders',
    path: '/open-tenders',
    icon: Gavel,
    roles: ['contractor'],
  },
  {
    label: 'My Bids',
    path: '/my-bids',
    icon: FileCheck,
    roles: ['contractor'],
  },
  {
    label: 'Awards',
    path: '/awards',
    icon: Award,
    roles: ['coordinator', 'dean', 'director', 'registrar'],
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    roles: ['coordinator', 'dean', 'director', 'registrar', 'contractor'],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 border-r bg-sidebar min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
