'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { INITIAL_HERMIT_USERS } from '@/lib/users-and-projects';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_HERMIT_USERS[0]);

  useEffect(() => {
    const saved = localStorage.getItem('hermit_current_user_id');
    if (saved) {
      const found = INITIAL_HERMIT_USERS.find(u => u.id === saved);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = INITIAL_HERMIT_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('hermit_current_user_id', found.id);
    }
  };

  const logout = () => {
    // For demo/dev: default to first user or prompt
    setCurrentUser(INITIAL_HERMIT_USERS[0]);
  };

  return (
    <AuthContext.Provider value={{ currentUser, availableUsers: INITIAL_HERMIT_USERS, switchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
