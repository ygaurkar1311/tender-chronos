import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'coordinator' | 'dean' | 'director' | 'registrar' | 'contractor';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole, department?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('tms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: email.split('@')[0],
      email,
      role,
      department: role === 'coordinator' ? 'Computer Science' : undefined
    };
    
    setUser(mockUser);
    localStorage.setItem('tms_user', JSON.stringify(mockUser));
  };

  const register = async (username: string, email: string, password: string, role: UserRole, department?: string) => {
    // Mock registration - simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      role,
      department
    };
    
    setUser(mockUser);
    localStorage.setItem('tms_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
