import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

// Contract ABIs (simplified for demo)
const AID_REQUEST_ABI = [
  "function createRequest(string title, string description, uint8 category, string location, uint256 targetAmount, uint256 durationDays, bool urgent, string ipfsHash) external returns (uint256)",
  "function donateToRequest(uint256 requestId, string message) external payable",
  "function getRequest(uint256 requestId) external view returns (tuple(uint256 id, string title, string description, uint8 category, string location, uint256 targetAmount, uint256 raisedAmount, address creator, uint256 deadline, uint8 status, bool urgent, bool verified, uint256 createdAt, string ipfsHash))",
  "function getActiveRequests(uint256 offset, uint256 limit) external view returns (tuple(uint256 id, string title, string description, uint8 category, string location, uint256 targetAmount, uint256 raisedAmount, address creator, uint256 deadline, uint8 status, bool urgent, bool verified, uint256 createdAt, string ipfsHash)[])",
  "function getUserRequests(address user) external view returns (uint256[])",
  "function getUserDonations(address user) external view returns (uint256[])",
  "function verifyRequest(uint256 requestId) external",
  "function withdrawFunds(uint256 requestId) external",
  "event RequestCreated(uint256 indexed requestId, address indexed creator, string title, uint256 targetAmount, uint8 category)",
  "event DonationMade(uint256 indexed requestId, address indexed donor, uint256 amount, string message)"
];

const GOVERNANCE_ABI = [
  "function createProposal(string title, string description, string rationale, string implementation, string timeline, uint8 category) external returns (uint256)",
  "function vote(uint256 proposalId, bool support, string reason) external",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, string title, string description, string rationale, string implementation, string timeline, uint8 category, address proposer, uint256 votesFor, uint256 votesAgainst, uint256 deadline, uint8 status, uint256 createdAt, bool executed))",
  "function getActiveProposals() external view returns (tuple(uint256 id, string title, string description, string rationale, string implementation, string timeline, uint8 category, address proposer, uint256 votesFor, uint256 votesAgainst, uint256 deadline, uint8 status, uint256 createdAt, bool executed)[])",
  "function finalizeProposal(uint256 proposalId) external",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint8 category)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, string reason)"
];

const REPUTATION_ABI = [
  "function getUserReputation(address user) external view returns (tuple(uint256 score, uint256 donationsCount, uint256 requestsCreated, uint256 requestsFulfilled, uint256 verificationsPerformed, uint256 votesParticipated, bool isVerified, uint256 lastUpdated))",
  "function getUserScore(address user) external view returns (uint256)",
  "function isUserVerified(address user) external view returns (bool)",
  "function getReputationLevel(address user) external view returns (string)"
];

// Contract addresses (these would be set after deployment)
const CONTRACT_ADDRESSES = {
  AidRequest: import.meta.env.VITE_AID_REQUEST_CONTRACT || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  Governance: import.meta.env.VITE_GOVERNANCE_CONTRACT || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  Reputation: import.meta.env.VITE_REPUTATION_CONTRACT || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

export const useContract = () => {
  const { provider, signer, isConnected } = useWallet();
  const [contracts, setContracts] = useState<{
    aidRequest: ethers.Contract | null;
    governance: ethers.Contract | null;
    reputation: ethers.Contract | null;
  }>({
    aidRequest: null,
    governance: null,
    reputation: null
  });

  useEffect(() => {
    if (provider && isConnected) {
      try {
        const aidRequestContract = new ethers.Contract(
          CONTRACT_ADDRESSES.AidRequest,
          AID_REQUEST_ABI,
          signer || provider
        );

        const governanceContract = new ethers.Contract(
          CONTRACT_ADDRESSES.Governance,
          GOVERNANCE_ABI,
          signer || provider
        );

        const reputationContract = new ethers.Contract(
          CONTRACT_ADDRESSES.Reputation,
          REPUTATION_ABI,
          provider
        );

        setContracts({
          aidRequest: aidRequestContract,
          governance: governanceContract,
          reputation: reputationContract
        });
      } catch (error) {
        console.error('Error initializing contracts:', error);
        setContracts({
          aidRequest: null,
          governance: null,
          reputation: null
        });
      }
    } else {
      setContracts({
        aidRequest: null,
        governance: null,
        reputation: null
      });
    }
  }, [provider, signer, isConnected]);

  return contracts;
};

export default useContract;