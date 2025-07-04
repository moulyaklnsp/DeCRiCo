import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useContract } from '../hooks/useContract';
import { handleContractError, waitForTransaction } from '../utils/contractHelpers';

interface BlockchainRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  creator: string;
  deadline: number;
  status: string;
  urgent: boolean;
  verified: boolean;
  createdAt: number;
  ipfsHash: string;
}

interface BlockchainProposal {
  id: string;
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
  status: string;
  createdAt: number;
  executed: boolean;
}

interface BlockchainContextType {
  // Requests
  createRequest: (requestData: any) => Promise<string>;
  donateToRequest: (requestId: string, amount: string, message?: string) => Promise<string>;
  getRequests: () => Promise<BlockchainRequest[]>;
  getUserRequests: (address: string) => Promise<BlockchainRequest[]>;
  
  // Proposals
  createProposal: (proposalData: any) => Promise<string>;
  voteOnProposal: (proposalId: string, support: boolean, reason?: string) => Promise<string>;
  getProposals: () => Promise<BlockchainProposal[]>;
  
  // Reputation
  getUserReputation: (address: string) => Promise<any>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, address, signer } = useWallet();
  const { aidRequest, governance, reputation } = useContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (requestData: any): Promise<string> => {
    if (!aidRequest || !signer) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const categoryMap: { [key: string]: number } = {
        'emergency': 0,
        'medical': 1,
        'housing': 2,
        'food': 3,
        'education': 4,
        'infrastructure': 5
      };

      const tx = await aidRequest.createRequest(
        requestData.title,
        requestData.description,
        categoryMap[requestData.category] || 0,
        requestData.location,
        ethers.parseEther(requestData.target),
        requestData.daysLeft || 30,
        requestData.urgent || false,
        requestData.ipfsHash || ''
      );

      const receipt = await waitForTransaction(tx);
      
      // Extract request ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = aidRequest.interface.parseLog(log);
          return parsed?.name === 'RequestCreated';
        } catch {
          return false;
        }
      });

      let requestId = Date.now().toString();
      if (event) {
        const parsed = aidRequest.interface.parseLog(event);
        requestId = parsed?.args?.requestId?.toString() || requestId;
      }

      return requestId;
    } catch (err: any) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const donateToRequest = async (requestId: string, amount: string, message = ''): Promise<string> => {
    if (!aidRequest || !signer) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await aidRequest.donateToRequest(requestId, message, {
        value: ethers.parseEther(amount)
      });

      const receipt = await waitForTransaction(tx);
      return receipt.hash;
    } catch (err: any) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequests = async (): Promise<BlockchainRequest[]> => {
    if (!aidRequest) {
      return [];
    }

    try {
      const requests = await aidRequest.getActiveRequests(0, 100);
      return requests.map((req: any) => ({
        id: req.id.toString(),
        title: req.title,
        description: req.description,
        category: ['emergency', 'medical', 'housing', 'food', 'education', 'infrastructure'][req.category] || 'emergency',
        location: req.location,
        targetAmount: ethers.formatEther(req.targetAmount),
        raisedAmount: ethers.formatEther(req.raisedAmount),
        creator: req.creator,
        deadline: Number(req.deadline),
        status: ['active', 'completed', 'cancelled'][req.status] || 'active',
        urgent: req.urgent,
        verified: req.verified,
        createdAt: Number(req.createdAt),
        ipfsHash: req.ipfsHash
      }));
    } catch (err) {
      console.error('Error fetching requests:', err);
      return [];
    }
  };

  const getUserRequests = async (userAddress: string): Promise<BlockchainRequest[]> => {
    if (!aidRequest) {
      return [];
    }

    try {
      const requestIds = await aidRequest.getUserRequests(userAddress);
      const requests = await Promise.all(
        requestIds.map(async (id: any) => {
          const req = await aidRequest.getRequest(id);
          return {
            id: req.id.toString(),
            title: req.title,
            description: req.description,
            category: ['emergency', 'medical', 'housing', 'food', 'education', 'infrastructure'][req.category] || 'emergency',
            location: req.location,
            targetAmount: ethers.formatEther(req.targetAmount),
            raisedAmount: ethers.formatEther(req.raisedAmount),
            creator: req.creator,
            deadline: Number(req.deadline),
            status: ['active', 'completed', 'cancelled'][req.status] || 'active',
            urgent: req.urgent,
            verified: req.verified,
            createdAt: Number(req.createdAt),
            ipfsHash: req.ipfsHash
          };
        })
      );
      return requests;
    } catch (err) {
      console.error('Error fetching user requests:', err);
      return [];
    }
  };

  const createProposal = async (proposalData: any): Promise<string> => {
    if (!governance || !signer) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const categoryMap: { [key: string]: number } = {
        'governance': 0,
        'funding': 1,
        'economics': 2,
        'technical': 3,
        'community': 4
      };

      const tx = await governance.createProposal(
        proposalData.title,
        proposalData.description,
        proposalData.rationale,
        proposalData.implementation,
        proposalData.timeline,
        categoryMap[proposalData.category] || 0
      );

      const receipt = await waitForTransaction(tx);
      
      // Extract proposal ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = governance.interface.parseLog(log);
          return parsed?.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });

      let proposalId = Date.now().toString();
      if (event) {
        const parsed = governance.interface.parseLog(event);
        proposalId = parsed?.args?.proposalId?.toString() || proposalId;
      }

      return proposalId;
    } catch (err: any) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const voteOnProposal = async (proposalId: string, support: boolean, reason = ''): Promise<string> => {
    if (!governance || !signer) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await governance.vote(proposalId, support, reason);
      const receipt = await waitForTransaction(tx);
      return receipt.hash;
    } catch (err: any) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProposals = async (): Promise<BlockchainProposal[]> => {
    if (!governance) {
      return [];
    }

    try {
      const proposals = await governance.getActiveProposals();
      return proposals.map((prop: any) => ({
        id: prop.id.toString(),
        title: prop.title,
        description: prop.description,
        rationale: prop.rationale,
        implementation: prop.implementation,
        timeline: prop.timeline,
        category: ['governance', 'funding', 'economics', 'technical', 'community'][prop.category] || 'governance',
        proposer: prop.proposer,
        votesFor: Number(prop.votesFor),
        votesAgainst: Number(prop.votesAgainst),
        deadline: Number(prop.deadline),
        status: ['active', 'passed', 'rejected', 'executed'][prop.status] || 'active',
        createdAt: Number(prop.createdAt),
        executed: prop.executed
      }));
    } catch (err) {
      console.error('Error fetching proposals:', err);
      return [];
    }
  };

  const getUserReputation = async (userAddress: string): Promise<any> => {
    if (!reputation) {
      return null;
    }

    try {
      const rep = await reputation.getUserReputation(userAddress);
      return {
        score: Number(rep.score),
        donationsCount: Number(rep.donationsCount),
        requestsCreated: Number(rep.requestsCreated),
        requestsFulfilled: Number(rep.requestsFulfilled),
        verificationsPerformed: Number(rep.verificationsPerformed),
        votesParticipated: Number(rep.votesParticipated),
        isVerified: rep.isVerified,
        lastUpdated: Number(rep.lastUpdated)
      };
    } catch (err) {
      console.error('Error fetching reputation:', err);
      return null;
    }
  };

  return (
    <BlockchainContext.Provider value={{
      createRequest,
      donateToRequest,
      getRequests,
      getUserRequests,
      createProposal,
      voteOnProposal,
      getProposals,
      getUserReputation,
      isLoading,
      error
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};