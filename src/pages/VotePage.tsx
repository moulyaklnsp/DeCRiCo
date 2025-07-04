import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, Clock, Users, TrendingUp, CheckCircle, X, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  timeLeft: string;
  status: 'active' | 'passed' | 'rejected';
  category: string;
  userVote?: 'for' | 'against' | null;
  rationale?: string;
  implementation?: string;
  timeline?: string;
}

const VotePage: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { user } = useAuth();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [showProposalDetails, setShowProposalDetails] = useState<string | null>(null);

  useEffect(() => {
    // Load proposals from localStorage or initialize with default data
    const savedProposals = localStorage.getItem('proposals');
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    } else {
      const defaultProposals: Proposal[] = [
        {
          id: '1',
          title: 'Increase Verification Requirements',
          description: 'Proposal to require additional documentation and community verification for aid requests above 10 ETH.',
          proposer: '0x1234...5678',
          votesFor: 1247,
          votesAgainst: 342,
          totalVotes: 1589,
          timeLeft: '5 days',
          status: 'active',
          category: 'governance',
          rationale: 'Higher value requests need more scrutiny to prevent fraud',
          implementation: 'Add additional verification steps for requests > 10 ETH',
          timeline: '2-3 weeks'
        },
        {
          id: '2',
          title: 'Emergency Response Fund',
          description: 'Create a community-managed emergency fund for rapid response to critical disasters.',
          proposer: '0xabcd...efgh',
          votesFor: 892,
          votesAgainst: 156,
          totalVotes: 1048,
          timeLeft: '12 days',
          status: 'active',
          category: 'funding',
          rationale: 'Need faster response times for emergency situations',
          implementation: 'Create dedicated emergency fund with automated triggers',
          timeline: '4-6 weeks'
        },
        {
          id: '3',
          title: 'Platform Fee Adjustment',
          description: 'Reduce platform fees from 2% to 1.5% to increase funds reaching beneficiaries.',
          proposer: '0x9876...4321',
          votesFor: 2156,
          votesAgainst: 234,
          totalVotes: 2390,
          timeLeft: 'Ended',
          status: 'passed',
          category: 'economics',
          rationale: 'More funds should reach those in need',
          implementation: 'Update smart contract fee structure',
          timeline: '1-2 weeks'
        }
      ];
      setProposals(defaultProposals);
      localStorage.setItem('proposals', JSON.stringify(defaultProposals));
    }
  }, []);

  const handleVote = async (proposalId: string, choice: 'for' | 'against') => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to vote');
      return;
    }

    setSelectedProposal(proposalId);
    setVoteChoice(choice);
    
    // Simulate voting process (no gas fees required)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update proposal with new vote
    const updatedProposals = proposals.map(proposal => {
      if (proposal.id === proposalId) {
        const newProposal = { ...proposal };
        if (choice === 'for') {
          newProposal.votesFor += 1;
        } else {
          newProposal.votesAgainst += 1;
        }
        newProposal.totalVotes += 1;
        newProposal.userVote = choice;
        return newProposal;
      }
      return proposal;
    });
    
    setProposals(updatedProposals);
    localStorage.setItem('proposals', JSON.stringify(updatedProposals));
    
    setSelectedProposal(null);
    setVoteChoice(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'passed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'funding':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'economics':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (selectedTab === 'active') return p.status === 'active';
    if (selectedTab === 'passed') return p.status === 'passed';
    if (selectedTab === 'rejected') return p.status === 'rejected';
    return true;
  });

  const activeProposals = proposals.filter(p => p.status === 'active');
  const totalVoters = proposals.reduce((sum, p) => sum + p.totalVotes, 0);
  const passedProposals = proposals.filter(p => p.status === 'passed').length;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Community Governance
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Participate in shaping the future of DeCRiCo. Vote on proposals that affect 
            platform policies, funding mechanisms, and community guidelines.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            Free Voting - No Gas Fees Required
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Vote className="h-8 w-8 text-cyan-400" />
              <span className="text-xs text-slate-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{activeProposals.length}</div>
            <div className="text-sm text-slate-300">Proposals</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-xs text-slate-400">Participation</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalVoters}</div>
            <div className="text-sm text-slate-300">Total votes</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <span className="text-xs text-slate-400">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {proposals.length > 0 ? Math.round((passedProposals / proposals.length) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-300">Proposals passed</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="text-xs text-slate-400">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {activeProposals.length > 0 ? Math.round((activeProposals.reduce((sum, p) => sum + p.totalVotes, 0) / activeProposals.length)) : 0}
            </div>
            <div className="text-sm text-slate-300">Avg votes per proposal</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'active', label: 'Active Proposals' },
                { id: 'passed', label: 'Passed' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'all', label: 'All Proposals' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    selectedTab === tab.id
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Proposals */}
        <div className="space-y-6">
          {filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                    {proposal.category.toUpperCase()}
                  </span>
                  {proposal.userVote && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      proposal.userVote === 'for' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      YOU VOTED {proposal.userVote.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {proposal.timeLeft}
                  </div>
                  <button
                    onClick={() => setShowProposalDetails(showProposalDetails === proposal.id ? null : proposal.id)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {proposal.title}
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                {proposal.description}
              </p>
              <p className="text-slate-400 text-xs mb-6 font-mono">
                Proposed by {proposal.proposer}
              </p>

              {/* Detailed View */}
              {showProposalDetails === proposal.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Rationale</h4>
                      <p className="text-slate-300 text-sm">{proposal.rationale}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">Implementation</h4>
                      <p className="text-slate-300 text-sm">{proposal.implementation}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">Timeline</h4>
                      <p className="text-slate-300 text-sm">{proposal.timeline}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Voting Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Votes</span>
                  <span className="font-medium text-white">
                    {proposal.totalVotes} total votes
                  </span>
                </div>
                
                {/* For Votes */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">For</span>
                    <span className="text-white">{proposal.votesFor} ({proposal.totalVotes > 0 ? Math.round((proposal.votesFor / proposal.totalVotes) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Against Votes */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Against</span>
                    <span className="text-white">{proposal.votesAgainst} ({proposal.totalVotes > 0 ? Math.round((proposal.votesAgainst / proposal.totalVotes) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${proposal.totalVotes > 0 ? (proposal.votesAgainst / proposal.totalVotes) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="bg-red-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Voting Buttons */}
              {proposal.status === 'active' && !proposal.userVote && isConnected && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVote(proposal.id, 'for')}
                    disabled={selectedProposal === proposal.id}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedProposal === proposal.id && voteChoice === 'for' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Voting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Vote For
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleVote(proposal.id, 'against')}
                    disabled={selectedProposal === proposal.id}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedProposal === proposal.id && voteChoice === 'against' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Voting...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Vote Against
                      </>
                    )}
                  </button>
                </div>
              )}

              {proposal.userVote && (
                <div className="text-center py-3 bg-slate-700/30 text-slate-300 rounded-lg border border-slate-600">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  You have already voted on this proposal
                </div>
              )}

              {proposal.status === 'passed' && (
                <div className="text-center py-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Proposal Passed
                </div>
              )}

              {proposal.status === 'rejected' && (
                <div className="text-center py-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                  <X className="h-5 w-5 inline mr-2" />
                  Proposal Rejected
                </div>
              )}

              {!isConnected && proposal.status === 'active' && (
                <div className="text-center py-3 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  Connect your wallet to vote on this proposal
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50"
          >
            <Vote className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No proposals found</h3>
            <p className="text-slate-400 mb-6">
              {selectedTab === 'active' ? 'No active proposals at the moment.' : `No ${selectedTab} proposals found.`}
            </p>
          </motion.div>
        )}

        {/* No Connection State */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 mt-8"
          >
            <Vote className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Connect Wallet to Vote</h3>
            <p className="text-slate-400 mb-6">
              Connect your wallet to participate in community governance and vote on proposals.
            </p>
            <div className="text-sm text-green-400">
              ✨ Voting is completely free - no gas fees required!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VotePage;