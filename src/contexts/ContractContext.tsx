import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useTransactions } from './TransactionContext';

interface AidRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  target: string;
  raised: string;
  contributors: number;
  daysLeft: number;
  urgent: boolean;
  verified: boolean;
  createdAt: string;
  creator: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Donation {
  id: string;
  requestId: string;
  donor: string;
  amount: string;
  timestamp: string;
  transactionHash: string;
}

interface ContractContextType {
  requests: AidRequest[];
  donations: Donation[];
  createRequest: (requestData: Omit<AidRequest, 'id' | 'raised' | 'contributors' | 'createdAt' | 'creator' | 'status'>) => Promise<string>;
  donateToRequest: (requestId: string, amount: string) => Promise<string>;
  getRequestById: (id: string) => AidRequest | undefined;
  getUserRequests: (userAddress: string) => AidRequest[];
  getUserDonations: (userAddress: string) => Donation[];
  isLoading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, address, signer } = useWallet();
  const { addTransaction } = useTransactions();
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('aidRequests');
    const savedDonations = localStorage.getItem('donations');
    
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      // Initialize with some sample data
      const sampleRequests: AidRequest[] = [
        {
          id: '1',
          title: 'Emergency Food Supplies - Turkey Earthquake',
          description: 'Providing emergency food supplies for 500 families affected by the recent earthquake in southern Turkey.',
          category: 'emergency',
          location: 'Kahramanmaras, Turkey',
          target: '15.0',
          raised: '12.3',
          contributors: 42,
          daysLeft: 5,
          urgent: true,
          verified: true,
          createdAt: '2025-01-09',
          creator: '0x1234567890abcdef1234567890abcdef12345678',
          status: 'active'
        },
        {
          id: '2',
          title: 'Medical Equipment for Flood Victims',
          description: 'Medical supplies and equipment needed for flood-affected communities in Bangladesh.',
          category: 'medical',
          location: 'Sylhet, Bangladesh',
          target: '8.5',
          raised: '6.2',
          contributors: 28,
          daysLeft: 12,
          urgent: false,
          verified: true,
          createdAt: '2025-01-08',
          creator: '0xabcd567890abcdef1234567890abcdef12345678',
          status: 'active'
        },
        {
          id: '3',
          title: 'School Reconstruction - Philippines',
          description: 'Rebuilding classrooms destroyed by Typhoon Mawar in the Philippines.',
          category: 'education',
          location: 'Luzon, Philippines',
          target: '18.5',
          raised: '18.5',
          contributors: 56,
          daysLeft: 0,
          urgent: false,
          verified: true,
          createdAt: '2025-01-05',
          creator: '0x5678567890abcdef1234567890abcdef12345678',
          status: 'completed'
        }
      ];
      setRequests(sampleRequests);
      localStorage.setItem('aidRequests', JSON.stringify(sampleRequests));
    }
    
    if (savedDonations) {
      setDonations(JSON.parse(savedDonations));
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('aidRequests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('donations', JSON.stringify(donations));
  }, [donations]);

  const createRequest = async (requestData: Omit<AidRequest, 'id' | 'raised' | 'contributors' | 'createdAt' | 'creator' | 'status'>): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest: AidRequest = {
        ...requestData,
        id: Date.now().toString(),
        raised: '0.0',
        contributors: 0,
        createdAt: new Date().toISOString().split('T')[0],
        creator: address,
        status: 'active'
      };

      const updatedRequests = [...requests, newRequest];
      setRequests(updatedRequests);

      // Add transaction record
      addTransaction({
        type: 'request_creation',
        from: address,
        description: `Created aid request: ${newRequest.title}`,
        status: 'completed',
        gasUsed: '150000',
        gasFee: '0.015',
        blockNumber: Math.floor(Math.random() * 1000000) + 18500000,
        requestId: newRequest.id
      });

      return newRequest.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const donateToRequest = async (requestId: string, amount: string): Promise<string> => {
    if (!isConnected || !address || !signer) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find the request
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Create donation record
      const newDonation: Donation = {
        id: Date.now().toString(),
        requestId,
        donor: address,
        amount,
        timestamp: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      // Update donations
      const updatedDonations = [...donations, newDonation];
      setDonations(updatedDonations);

      // Update request with new raised amount and contributor count
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          const newRaised = (parseFloat(request.raised) + parseFloat(amount)).toFixed(4);
          const newContributors = request.contributors + 1;
          return {
            ...request,
            raised: newRaised,
            contributors: newContributors,
            status: parseFloat(newRaised) >= parseFloat(request.target) ? 'completed' as const : request.status
          };
        }
        return request;
      });

      setRequests(updatedRequests);

      // Add transaction record
      addTransaction({
        type: 'donation',
        from: address,
        to: request.creator,
        amount,
        description: `Donation to: ${request.title}`,
        status: 'completed',
        gasUsed: '21000',
        gasFee: '0.003',
        blockNumber: Math.floor(Math.random() * 1000000) + 18500000,
        requestId
      });

      return newDonation.transactionHash;
    } catch (err: any) {
      setError(err.message || 'Failed to process donation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestById = (id: string): AidRequest | undefined => {
    return requests.find(request => request.id === id);
  };

  const getUserRequests = (userAddress: string): AidRequest[] => {
    return requests.filter(request => request.creator.toLowerCase() === userAddress.toLowerCase());
  };

  const getUserDonations = (userAddress: string): Donation[] => {
    return donations.filter(donation => donation.donor.toLowerCase() === userAddress.toLowerCase());
  };

  return (
    <ContractContext.Provider value={{
      requests,
      donations,
      createRequest,
      donateToRequest,
      getRequestById,
      getUserRequests,
      getUserDonations,
      isLoading,
      error
    }}>
      {children}
    </ContractContext.Provider>
  );
};