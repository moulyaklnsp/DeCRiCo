import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  type: 'donation' | 'request_creation' | 'vote' | 'proposal_creation' | 'verification' | 'withdrawal';
  from: string;
  to?: string;
  amount?: string;
  requestId?: string;
  proposalId?: string;
  description: string;
  timestamp: string;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: string;
  gasFee?: string;
  blockNumber?: number;
  metadata?: Record<string, any>;
}

interface TransactionContextType {
  transactions: Transaction[];
  getUserTransactions: (userAddress: string) => Transaction[];
  getAllTransactions: () => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'transactionHash'>) => string;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTransactionsByRequest: (requestId: string) => Transaction[];
  getTotalVolume: () => number;
  getDailyVolume: (date: string) => number;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useWallet();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with sample transactions
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          type: 'donation',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          to: '0xabcd567890abcdef1234567890abcdef12345678',
          amount: '2.5',
          requestId: '1',
          description: 'Donation to Emergency Food Supplies - Turkey Earthquake',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'completed',
          gasUsed: '21000',
          gasFee: '0.003',
          blockNumber: 18500000
        },
        {
          id: '2',
          type: 'request_creation',
          from: '0xabcd567890abcdef1234567890abcdef12345678',
          description: 'Created aid request: Medical Equipment for Flood Victims',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'completed',
          gasUsed: '150000',
          gasFee: '0.015',
          blockNumber: 18499500,
          requestId: '2'
        },
        {
          id: '3',
          type: 'vote',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          description: 'Voted FOR on proposal: Increase Verification Requirements',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'completed',
          gasUsed: '45000',
          gasFee: '0.005',
          blockNumber: 18499000,
          proposalId: '1'
        }
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp' | 'transactionHash'>): string => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction.id;
  };

  const getUserTransactions = (userAddress: string): Transaction[] => {
    return transactions.filter(tx => 
      tx.from.toLowerCase() === userAddress.toLowerCase() || 
      tx.to?.toLowerCase() === userAddress.toLowerCase()
    );
  };

  const getAllTransactions = (): Transaction[] => {
    return transactions;
  };

  const getTransactionById = (id: string): Transaction | undefined => {
    return transactions.find(tx => tx.id === id);
  };

  const getTransactionsByType = (type: Transaction['type']): Transaction[] => {
    return transactions.filter(tx => tx.type === type);
  };

  const getTransactionsByRequest = (requestId: string): Transaction[] => {
    return transactions.filter(tx => tx.requestId === requestId);
  };

  const getTotalVolume = (): number => {
    return transactions
      .filter(tx => tx.type === 'donation' && tx.amount)
      .reduce((sum, tx) => sum + parseFloat(tx.amount!), 0);
  };

  const getDailyVolume = (date: string): number => {
    const targetDate = new Date(date).toDateString();
    return transactions
      .filter(tx => 
        tx.type === 'donation' && 
        tx.amount && 
        new Date(tx.timestamp).toDateString() === targetDate
      )
      .reduce((sum, tx) => sum + parseFloat(tx.amount!), 0);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      getUserTransactions,
      getAllTransactions,
      addTransaction,
      getTransactionById,
      getTransactionsByType,
      getTransactionsByRequest,
      getTotalVolume,
      getDailyVolume,
      isLoading
    }}>
      {children}
    </TransactionContext.Provider>
  );
};