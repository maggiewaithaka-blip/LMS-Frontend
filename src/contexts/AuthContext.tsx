import React, { createContext, useContext, useState, useEffect } from 'react';
// FIX: Changing relative path to explicitly include the file extension .ts
import { api, User } from '../lib/api.ts'; 

interface AuthContextType {
  user: User | null;
  // Login now explicitly returns the User object upon successful token retrieval AND profile fetch.
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load the user profile and set state
  const loadCurrentUser = async () => {
    try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
    } catch (error) {
        // If /me fails, assume token is invalid or expired
        console.error('Failed to get current user:', error);
        api.logout();
        setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is already logged in on application load/refresh
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        await loadCurrentUser();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    // 1. Call login API. api.login should only handle token retrieval and saving it
    // (e.g., to localStorage), and should throw an error if credentials fail.
    await api.login({ username, password }); 
    
    // 2. Immediately call the protected endpoint /api/users/me using the newly saved token.
    const userProfile = await api.getCurrentUser();
    
    // 3. Update the context state
    setUser(userProfile);
    
    // 4. Return the user object for the calling component (Login.tsx)
    return userProfile;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}