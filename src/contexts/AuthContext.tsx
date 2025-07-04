import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

export type UserType = 'donor' | 'requester' | 'verifier' | 'admin';

interface User {
  id: number;
  email: string;
  name: string;
  userType: UserType;
  walletAddress: string;
  reputation: number;
  avatar: string;
  joinedAt: string;
  verified: boolean;
  bio?: string;
  location?: string;
  website?: string;
  preferences?: {
    emailNotifications: boolean;
    updateNotifications: boolean;
    weeklyReports: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateUserType: (userType: UserType) => void;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  walletAddress: string;
  userType: UserType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getUserByWallet, createUser, updateUser: updateUserInDb } = useDatabase();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWalletAddress = (address: string): boolean => {
    return address.startsWith('0x') && address.length === 42;
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user exists in localStorage (for password verification)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!existingUser) {
        return { success: false, error: 'No account found with this email address' };
      }

      if (existingUser.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again' };
      }
      
      // Get user from database
      const dbUser = await getUserByWallet(existingUser.walletAddress);
      if (dbUser) {
        setUser(dbUser);
        localStorage.setItem('currentUser', JSON.stringify(dbUser));
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Account data not found. Please contact support' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again' };
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!userData.name || !userData.email || !userData.password || !userData.walletAddress) {
        return { success: false, error: 'All fields are required' };
      }

      if (!validateEmail(userData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (!validatePassword(userData.password)) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (!validateWalletAddress(userData.walletAddress)) {
        return { success: false, error: 'Please enter a valid Ethereum wallet address (0x...)' };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user already exists
      const existingUser = await getUserByWallet(userData.walletAddress);
      if (existingUser) {
        return { success: false, error: 'An account with this wallet address already exists' };
      }
      
      // Check email in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingEmail = users.find((u: any) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingEmail) {
        return { success: false, error: 'An account with this email already exists' };
      }
      
      // Create new user in database
      const newUser = {
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        walletAddress: userData.walletAddress,
        reputation: 0,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        joinedAt: new Date().toISOString(),
        verified: false,
        preferences: {
          emailNotifications: true,
          updateNotifications: true,
          weeklyReports: false
        }
      };
      
      const userId = await createUser(newUser);
      const createdUser = { ...newUser, id: userId };
      
      // Store user with password for login (in localStorage)
      const userWithPassword = { ...createdUser, password: userData.password };
      users.push(userWithPassword);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      setUser(createdUser);
      localStorage.setItem('currentUser', JSON.stringify(createdUser));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Account creation failed. Please try again' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await updateUserInDb(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users array for login
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const updateUserType = (userType: UserType) => {
    if (user) {
      updateUser({ userType });
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
      updateUserType,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};