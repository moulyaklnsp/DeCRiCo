import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ContactPage } from './pages/ContactPage';
import { BrowseRequestsPage } from './pages/BrowseRequestsPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { DonorDashboard } from './components/dashboard/DonorDashboard';
import { RequesterDashboard } from './components/dashboard/RequesterDashboard';
import { VerifierDashboard } from './components/dashboard/VerifierDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { user, isAuthenticated, setUser, setAuthenticated, loading, setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile) {
            setUser(profile);
            setAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile) {
            setUser(profile);
            setAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setAuthenticated, setLoading]);

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'donor':
        return <DonorDashboard />;
      case 'requester':
        return <RequesterDashboard />;
      case 'verifier':
        return <VerifierDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            DeCriCo
          </h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #10b981, #059669)',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              },
            },
          }}
        />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/browse" element={<BrowseRequestsPage />} />
            <Route path="/request/:id" element={<RequestDetailsPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {getDashboardComponent()}
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;