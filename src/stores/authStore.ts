import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string, role: string, walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user: User | null) => set({ user }),
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setLoading: (loading: boolean) => set({ loading }),

  signUp: async (email: string, password: string, username: string, role: string, walletAddress: string) => {
    try {
      // Check for existing users with same wallet address and role
      if (role !== 'admin') {
        const { data: existingWalletUser } = await supabase
          .from('users')
          .select('id, role, wallet_address')
          .eq('wallet_address', walletAddress)
          .eq('role', role)
          .single();

        if (existingWalletUser) {
          const errorMessage = `A ${role} with this wallet address already exists. Same role users cannot share wallet addresses.`;
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      }

      // Check for existing email/username
      const { data: existingUser } = await supabase
        .from('users')
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

      if (existingUser) {
        const errorMessage = existingUser.email === email 
          ? 'An account with this email already exists. Please try signing in instead.'
          : 'This username is already taken. Please choose a different username.';
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Failed to create account. Please try again.';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment before trying again.';
        }
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        // Create user profile with wallet address
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
            role,
            wallet_address: walletAddress,
          });

        if (profileError) {
          let errorMessage = 'Failed to create user profile. Please try again.';
          
          if (profileError.message.includes('users_email_key')) {
            errorMessage = 'An account with this email already exists.';
          } else if (profileError.message.includes('users_username_key')) {
            errorMessage = 'This username is already taken. Please choose a different username.';
          }
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }

        toast.success('Account created successfully!');
        
        // Auto sign in after successful signup
        const signInResult = await get().signIn(email, password);
        return signInResult;
      }

      return { success: false, error: 'Failed to create account. Please try again.' };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Failed to sign in. Please check your credentials.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link before signing in.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment before trying again.';
        }
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          set({ 
            user: profile, 
            isAuthenticated: true 
          });
          return { success: true };
        }
      }

      return { success: false, error: 'Failed to sign in. Please try again.' };
    } catch (error) {
      console.error('Signin error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Failed to sign out');
        return;
      }
      set({ 
        user: null, 
        isAuthenticated: false 
      });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      toast.error('Failed to sign out');
    }
  },
}));