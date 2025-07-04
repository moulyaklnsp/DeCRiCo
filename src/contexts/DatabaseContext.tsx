import React, { createContext, useContext, useEffect, useState } from 'react';
import Dexie, { Table } from 'dexie';

// Database Schema Interfaces
export interface User {
  id?: number;
  walletAddress: string;
  email: string;
  name: string;
  userType: 'donor' | 'requester' | 'verifier' | 'admin';
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  reputation: number;
  verified: boolean;
  joinedAt: string;
  lastLogin?: string;
  preferences?: {
    emailNotifications: boolean;
    updateNotifications: boolean;
    weeklyReports: boolean;
  };
}

export interface AidRequest {
  id?: number;
  blockchainId?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  creator: string;
  deadline: number;
  status: 'active' | 'completed' | 'cancelled';
  urgent: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  ipfsHash?: string;
  mediaFiles: string[];
  externalLinks: string[];
  contactInfo: string;
  proofDocuments?: string;
}

export interface Donation {
  id?: number;
  requestId: number;
  donor: string;
  amount: string;
  message?: string;
  timestamp: string;
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  gasFee?: string;
  network: string;
}

export interface Transaction {
  id?: number;
  type: 'donation' | 'request_creation' | 'vote' | 'proposal_creation' | 'verification' | 'withdrawal';
  from: string;
  to?: string;
  amount?: string;
  requestId?: number;
  proposalId?: number;
  description: string;
  timestamp: string;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: string;
  gasFee?: string;
  blockNumber?: number;
  network: string;
  metadata?: any;
}

export interface Proposal {
  id?: number;
  blockchainId?: string;
  title: string;
  description: string;
  rationale: string;
  implementation: string;
  timeline: string;
  category: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  deadline: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: string;
  executed: boolean;
}

export interface Vote {
  id?: number;
  proposalId: number;
  voter: string;
  support: boolean;
  reason?: string;
  timestamp: string;
  transactionHash?: string;
  network: string;
}

// Database Class
class DeCRiCoDatabase extends Dexie {
  users!: Table<User>;
  aidRequests!: Table<AidRequest>;
  donations!: Table<Donation>;
  transactions!: Table<Transaction>;
  proposals!: Table<Proposal>;
  votes!: Table<Vote>;

  constructor() {
    super('DeCRiCoDatabase');
    
    this.version(1).stores({
      users: '++id, walletAddress, email, userType, verified, joinedAt',
      aidRequests: '++id, blockchainId, creator, category, status, createdAt, verified',
      donations: '++id, requestId, donor, timestamp, network',
      transactions: '++id, type, from, to, timestamp, network, status',
      proposals: '++id, blockchainId, proposer, category, status, createdAt',
      votes: '++id, proposalId, voter, timestamp, network'
    });
  }
}

const db = new DeCRiCoDatabase();

interface DatabaseContextType {
  // Users
  createUser: (user: Omit<User, 'id'>) => Promise<number>;
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  getUserByWallet: (walletAddress: string) => Promise<User | undefined>;
  getAllUsers: () => Promise<User[]>;
  
  // Aid Requests
  createAidRequest: (request: Omit<AidRequest, 'id'>) => Promise<number>;
  updateAidRequest: (id: number, updates: Partial<AidRequest>) => Promise<void>;
  getAidRequest: (id: number) => Promise<AidRequest | undefined>;
  getAidRequestsByCreator: (creator: string) => Promise<AidRequest[]>;
  getAllAidRequests: () => Promise<AidRequest[]>;
  getActiveAidRequests: () => Promise<AidRequest[]>;
  
  // Donations
  createDonation: (donation: Omit<Donation, 'id'>) => Promise<number>;
  getDonationsByRequest: (requestId: number) => Promise<Donation[]>;
  getDonationsByDonor: (donor: string) => Promise<Donation[]>;
  getAllDonations: () => Promise<Donation[]>;
  
  // Transactions
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<number>;
  updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<void>;
  getTransactionsByUser: (userAddress: string) => Promise<Transaction[]>;
  getAllTransactions: () => Promise<Transaction[]>;
  getTransactionsByNetwork: (network: string) => Promise<Transaction[]>;
  
  // Proposals
  createProposal: (proposal: Omit<Proposal, 'id'>) => Promise<number>;
  updateProposal: (id: number, updates: Partial<Proposal>) => Promise<void>;
  getProposal: (id: number) => Promise<Proposal | undefined>;
  getAllProposals: () => Promise<Proposal[]>;
  getActiveProposals: () => Promise<Proposal[]>;
  
  // Votes
  createVote: (vote: Omit<Vote, 'id'>) => Promise<number>;
  getVotesByProposal: (proposalId: number) => Promise<Vote[]>;
  getVotesByUser: (voter: string) => Promise<Vote[]>;
  getUserVoteForProposal: (proposalId: number, voter: string) => Promise<Vote | undefined>;
  
  // Analytics
  getTotalVolume: () => Promise<number>;
  getVolumeByNetwork: (network: string) => Promise<number>;
  getUserStats: (userAddress: string) => Promise<any>;
  getPlatformStats: () => Promise<any>;
  
  // Database management
  clearAllData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.open();
        
        // Initialize with sample data if empty
        const userCount = await db.users.count();
        if (userCount === 0) {
          await initializeSampleData();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeDatabase();
  }, []);

  const initializeSampleData = async () => {
    // Sample users
    const sampleUsers: Omit<User, 'id'>[] = [
      {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        email: 'donor@example.com',
        name: 'John Donor',
        userType: 'donor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        reputation: 85,
        verified: true,
        joinedAt: new Date().toISOString(),
        preferences: {
          emailNotifications: true,
          updateNotifications: true,
          weeklyReports: false
        }
      },
      {
        walletAddress: '0xabcd567890abcdef1234567890abcdef12345678',
        email: 'requester@example.com',
        name: 'Maria Requester',
        userType: 'requester',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        reputation: 92,
        verified: true,
        joinedAt: new Date().toISOString(),
        preferences: {
          emailNotifications: true,
          updateNotifications: true,
          weeklyReports: true
        }
      },
      {
        walletAddress: '0x5678567890abcdef1234567890abcdef12345678',
        email: 'admin@decrico.org',
        name: 'Admin User',
        userType: 'admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        reputation: 100,
        verified: true,
        joinedAt: new Date().toISOString(),
        preferences: {
          emailNotifications: true,
          updateNotifications: true,
          weeklyReports: true
        }
      }
    ];

    await db.users.bulkAdd(sampleUsers);

    // Sample aid requests
    const sampleRequests: Omit<AidRequest, 'id'>[] = [
      {
        title: 'Emergency Food Supplies - Turkey Earthquake',
        description: 'Providing emergency food supplies for 500 families affected by the recent earthquake in southern Turkey.',
        category: 'emergency',
        location: 'Kahramanmaras, Turkey',
        targetAmount: '15.0',
        raisedAmount: '12.3',
        creator: '0xabcd567890abcdef1234567890abcdef12345678',
        deadline: Date.now() + (5 * 24 * 60 * 60 * 1000),
        status: 'active',
        urgent: true,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaFiles: [],
        externalLinks: [],
        contactInfo: 'emergency@turkeyrelief.org'
      },
      {
        title: 'Medical Equipment for Flood Victims',
        description: 'Medical supplies and equipment needed for flood-affected communities in Bangladesh.',
        category: 'medical',
        location: 'Sylhet, Bangladesh',
        targetAmount: '8.5',
        raisedAmount: '6.2',
        creator: '0xabcd567890abcdef1234567890abcdef12345678',
        deadline: Date.now() + (12 * 24 * 60 * 60 * 1000),
        status: 'active',
        urgent: false,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaFiles: [],
        externalLinks: [],
        contactInfo: 'medical@bangladeshaid.org'
      }
    ];

    await db.aidRequests.bulkAdd(sampleRequests);
  };

  // User operations
  const createUser = async (user: Omit<User, 'id'>) => {
    return await db.users.add(user);
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    await db.users.update(id, updates);
  };

  const getUserByWallet = async (walletAddress: string) => {
    return await db.users.where('walletAddress').equals(walletAddress).first();
  };

  const getAllUsers = async () => {
    return await db.users.toArray();
  };

  // Aid Request operations
  const createAidRequest = async (request: Omit<AidRequest, 'id'>) => {
    return await db.aidRequests.add(request);
  };

  const updateAidRequest = async (id: number, updates: Partial<AidRequest>) => {
    await db.aidRequests.update(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const getAidRequest = async (id: number) => {
    return await db.aidRequests.get(id);
  };

  const getAidRequestsByCreator = async (creator: string) => {
    return await db.aidRequests.where('creator').equals(creator).toArray();
  };

  const getAllAidRequests = async () => {
    return await db.aidRequests.orderBy('createdAt').reverse().toArray();
  };

  const getActiveAidRequests = async () => {
    return await db.aidRequests.where('status').equals('active').toArray();
  };

  // Donation operations
  const createDonation = async (donation: Omit<Donation, 'id'>) => {
    return await db.donations.add(donation);
  };

  const getDonationsByRequest = async (requestId: number) => {
    return await db.donations.where('requestId').equals(requestId).toArray();
  };

  const getDonationsByDonor = async (donor: string) => {
    return await db.donations.where('donor').equals(donor).toArray();
  };

  const getAllDonations = async () => {
    return await db.donations.toArray();
  };

  // Transaction operations
  const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    return await db.transactions.add(transaction);
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    await db.transactions.update(id, updates);
  };

  const getTransactionsByUser = async (userAddress: string) => {
    return await db.transactions
      .where('from').equals(userAddress)
      .or('to').equals(userAddress)
      .reverse()
      .sortBy('timestamp');
  };

  const getAllTransactions = async () => {
    return await db.transactions.orderBy('timestamp').reverse().toArray();
  };

  const getTransactionsByNetwork = async (network: string) => {
    return await db.transactions.where('network').equals(network).toArray();
  };

  // Proposal operations
  const createProposal = async (proposal: Omit<Proposal, 'id'>) => {
    return await db.proposals.add(proposal);
  };

  const updateProposal = async (id: number, updates: Partial<Proposal>) => {
    await db.proposals.update(id, updates);
  };

  const getProposal = async (id: number) => {
    return await db.proposals.get(id);
  };

  const getAllProposals = async () => {
    return await db.proposals.orderBy('createdAt').reverse().toArray();
  };

  const getActiveProposals = async () => {
    return await db.proposals.where('status').equals('active').toArray();
  };

  // Vote operations
  const createVote = async (vote: Omit<Vote, 'id'>) => {
    return await db.votes.add(vote);
  };

  const getVotesByProposal = async (proposalId: number) => {
    return await db.votes.where('proposalId').equals(proposalId).toArray();
  };

  const getVotesByUser = async (voter: string) => {
    return await db.votes.where('voter').equals(voter).toArray();
  };

  const getUserVoteForProposal = async (proposalId: number, voter: string) => {
    return await db.votes
      .where('proposalId').equals(proposalId)
      .and(vote => vote.voter === voter)
      .first();
  };

  // Analytics
  const getTotalVolume = async () => {
    const donations = await db.donations.toArray();
    return donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
  };

  const getVolumeByNetwork = async (network: string) => {
    const donations = await db.donations.where('network').equals(network).toArray();
    return donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
  };

  const getUserStats = async (userAddress: string) => {
    const donations = await getDonationsByDonor(userAddress);
    const requests = await getAidRequestsByCreator(userAddress);
    const votes = await getVotesByUser(userAddress);
    
    return {
      totalDonated: donations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
      donationCount: donations.length,
      requestsCreated: requests.length,
      votesParticipated: votes.length,
      successfulRequests: requests.filter(r => r.status === 'completed').length
    };
  };

  const getPlatformStats = async () => {
    const users = await getAllUsers();
    const requests = await getAllAidRequests();
    const donations = await getAllDonations();
    const totalVolume = await getTotalVolume();
    
    return {
      totalUsers: users.length,
      totalRequests: requests.length,
      activeRequests: requests.filter(r => r.status === 'active').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      totalDonations: donations.length,
      totalVolume,
      averageDonation: donations.length > 0 ? totalVolume / donations.length : 0
    };
  };

  // Database management
  const clearAllData = async () => {
    await db.delete();
    await db.open();
  };

  const exportData = async () => {
    const data = {
      users: await db.users.toArray(),
      aidRequests: await db.aidRequests.toArray(),
      donations: await db.donations.toArray(),
      transactions: await db.transactions.toArray(),
      proposals: await db.proposals.toArray(),
      votes: await db.votes.toArray()
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      await db.transaction('rw', db.users, db.aidRequests, db.donations, db.transactions, db.proposals, db.votes, async () => {
        if (data.users) await db.users.bulkPut(data.users);
        if (data.aidRequests) await db.aidRequests.bulkPut(data.aidRequests);
        if (data.donations) await db.donations.bulkPut(data.donations);
        if (data.transactions) await db.transactions.bulkPut(data.transactions);
        if (data.proposals) await db.proposals.bulkPut(data.proposals);
        if (data.votes) await db.votes.bulkPut(data.votes);
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{
      createUser,
      updateUser,
      getUserByWallet,
      getAllUsers,
      createAidRequest,
      updateAidRequest,
      getAidRequest,
      getAidRequestsByCreator,
      getAllAidRequests,
      getActiveAidRequests,
      createDonation,
      getDonationsByRequest,
      getDonationsByDonor,
      getAllDonations,
      createTransaction,
      updateTransaction,
      getTransactionsByUser,
      getAllTransactions,
      getTransactionsByNetwork,
      createProposal,
      updateProposal,
      getProposal,
      getAllProposals,
      getActiveProposals,
      createVote,
      getVotesByProposal,
      getVotesByUser,
      getUserVoteForProposal,
      getTotalVolume,
      getVolumeByNetwork,
      getUserStats,
      getPlatformStats,
      clearAllData,
      exportData,
      importData
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};