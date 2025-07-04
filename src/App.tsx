import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { ContractProvider } from './contexts/ContractContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestsPage from './pages/RequestsPage';
import DashboardPage from './pages/DashboardPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DonatePage from './pages/DonatePage';
import VotePage from './pages/VotePage';
import ProposePage from './pages/ProposePage';
import AdminPage from './pages/AdminPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';

function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <WalletProvider>
          <TransactionProvider>
            <ContractProvider>
              <BlockchainProvider>
                <Router>
                  <div className="min-h-screen relative">
                    <AnimatedBackground />
                    <Header />
                    <main className="flex-1 relative z-10">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/create" element={<CreateRequestPage />} />
                        <Route path="/requests" element={<RequestsPage />} />
                        <Route path="/request/:id" element={<RequestDetailPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/donate" element={<DonatePage />} />
                        <Route path="/vote" element={<VotePage />} />
                        <Route path="/propose" element={<ProposePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/transactions" element={<TransactionHistoryPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </Router>
              </BlockchainProvider>
            </ContractProvider>
          </TransactionProvider>
        </WalletProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
}

export default App;