import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Vote,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Target,
  Award,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { Request, Donation, Vote as VoteType } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { walletService } from '../../lib/wallet';
import toast from 'react-hot-toast';

export const DonorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'vote' | 'dashboard' | 'profile'>('browse');
  const [requests, setRequests] = useState<Request[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
    fetchDonations();
    fetchVotes();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:users!requester_id(id, username, email, wallet_address),
          votes(*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched requests:', data); // Debug log
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          request:requests(title, description, requester:users!requester_id(username))
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    }
  };

  const fetchVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          request:requests(title, description)
        `)
        .eq('voter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVotes(data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast.error('Failed to load votes');
    }
  };

  const handleDonate = async (requestId: string, amount: string) => {
    if (!user?.wallet_address) {
      toast.error('Please update your wallet address in profile settings');
      return;
    }

    const request = requests.find(r => r.id === requestId);
    console.log('Found request:', request); // Debug log
    
    if (!request) {
      toast.error('Request not found');
      return;
    }

    if (!request.requester) {
      toast.error('Requester information not found');
      return;
    }

    if (!request.requester.wallet_address) {
      toast.error('Requester wallet address not set. Please contact the requester to update their wallet address.');
      return;
    }

    console.log('Requester wallet address:', request.requester.wallet_address); // Debug log

    setLoading(true);
    try {
      // Send transaction via MetaMask
      const txHash = await walletService.sendTransaction(
        request.requester.wallet_address,
        amount
      );

      if (!txHash) {
        throw new Error('Transaction failed');
      }

      // Save donation to database
      const { error } = await supabase
        .from('donations')
        .insert([
          {
            request_id: requestId,
            donor_id: user.id,
            amount: parseFloat(amount),
            transaction_hash: txHash,
            status: 'completed',
          },
        ]);

      if (error) throw error;

      toast.success('Donation sent successfully!');
      fetchRequests();
      fetchDonations();
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to send donation');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (requestId: string, voteType: 'approve' | 'reject') => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('request_id', requestId)
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        toast.error('You have already voted on this request');
        return;
      }

      // Cast vote
      const { error } = await supabase
        .from('votes')
        .insert([
          {
            request_id: requestId,
            voter_id: user.id,
            vote_type: voteType,
          },
        ]);

      if (error) throw error;

      toast.success(`Vote ${voteType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      fetchRequests();
      fetchVotes();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to cast vote');
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'urgent':
        return matchesSearch && request.amount_raised < request.amount_needed * 0.5;
      case 'almost_funded':
        return matchesSearch && request.amount_raised >= request.amount_needed * 0.8;
      default:
        return matchesSearch;
    }
  });

  const stats = {
    totalDonated: donations.reduce((sum, donation) => sum + donation.amount, 0),
    totalRequests: requests.length,
    myDonations: donations.length,
    myVotes: votes.length,
    impactScore: donations.length * 10 + votes.length * 5,
  };

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search donation requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-lg border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-lg border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="urgent">Urgent</option>
            <option value="almost_funded">Almost Funded</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading requests...</span>
        </div>
      )}

      {/* Requests Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request, index) => (
            <RequestCard
              key={request.id}
              request={request}
              onDonate={handleDonate}
              loading={loading}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderVoteTab = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Vote className="w-6 h-6 mr-2 text-blue-600" />
          Gas-Free Voting on Proposals
        </h3>
        <p className="text-gray-600 mb-6">
          Vote on upcoming proposals and requests without any gas fees. Your voice matters in shaping the platform.
        </p>

        <div className="grid gap-4">
          {requests.filter(r => r.status === 'pending').map((request) => (
            <VoteCard
              key={request.id}
              request={request}
              onVote={handleVote}
              userVote={votes.find(v => v.request_id === request.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Donated</p>
              <p className="text-2xl font-bold">{stats.totalDonated.toFixed(4)} ETH</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Donations Made</p>
              <p className="text-2xl font-bold">{stats.myDonations}</p>
            </div>
            <Heart className="w-10 h-10 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Votes Cast</p>
              <p className="text-2xl font-bold">{stats.myVotes}</p>
            </div>
            <Vote className="w-10 h-10 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Impact Score</p>
              <p className="text-2xl font-bold">{stats.impactScore}</p>
            </div>
            <Award className="w-10 h-10 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Requests Helped</p>
              <p className="text-2xl font-bold">{new Set(donations.map(d => d.request_id)).size}</p>
            </div>
            <Target className="w-10 h-10 text-pink-200" />
          </div>
        </motion.div>
      </div>

      {/* Donation History */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          My Donation History & Impact Report
        </h3>
        
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{donation.request?.title}</h4>
                  <p className="text-sm text-gray-600">To: {donation.request?.requester?.username}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{donation.amount.toFixed(4)} ETH</p>
                  <p className="text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                  donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {donation.status}
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${donation.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
                >
                  View Transaction
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          Profile Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              value={user?.wallet_address || 'Not set'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Donor Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Browse requests, vote on proposals, and track your impact
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-white/50 backdrop-blur-lg rounded-xl p-2">
        {[
          { id: 'browse', label: 'Browse Requests', icon: Search },
          { id: 'vote', label: 'Vote on Proposals', icon: Vote },
          { id: 'dashboard', label: 'My Dashboard', icon: BarChart3 },
          { id: 'profile', label: 'Profile Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'browse' && renderBrowseTab()}
        {activeTab === 'vote' && renderVoteTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>
    </div>
  );
};

interface RequestCardProps {
  request: Request;
  onDonate: (requestId: string, amount: string) => void;
  loading: boolean;
  index: number;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onDonate, loading, index }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);

  const progress = (request.amount_raised / request.amount_needed) * 100;

  const handleDonateClick = () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    onDonate(request.id, donationAmount);
    setDonationAmount('');
    setShowDonationForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{request.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{request.description}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-800">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">
            {request.amount_raised.toFixed(4)} ETH raised
          </span>
          <span className="text-sm font-medium text-gray-800">
            Goal: {request.amount_needed.toFixed(4)} ETH
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>By {request.requester?.username}</span>
        <span>{request.votes?.length || 0} votes</span>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mb-2">
          Wallet: {request.requester?.wallet_address ? 'Set' : 'Not set'}
        </div>
      )}

      {!showDonationForm ? (
        <button
          onClick={() => setShowDonationForm(true)}
          disabled={loading || !request.requester?.wallet_address}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart className="w-4 h-4" />
          <span>{!request.requester?.wallet_address ? 'Wallet Not Set' : 'Donate Now'}</span>
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="number"
            step="0.001"
            placeholder="Amount in ETH"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleDonateClick}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </button>
            <button
              onClick={() => setShowDonationForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface VoteCardProps {
  request: Request;
  onVote: (requestId: string, voteType: 'approve' | 'reject') => void;
  userVote?: VoteType;
}

const VoteCard: React.FC<VoteCardProps> = ({ request, onVote, userVote }) => {
  const approveVotes = request.votes?.filter(v => v.vote_type === 'approve').length || 0;
  const rejectVotes = request.votes?.filter(v => v.vote_type === 'reject').length || 0;

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{request.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{request.amount_needed.toFixed(4)} ETH needed</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-4 text-sm">
          <span className="text-green-600 flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {approveVotes}
          </span>
          <span className="text-red-600 flex items-center">
            <ThumbsDown className="w-4 h-4 mr-1" />
            {rejectVotes}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
      </div>

      {userVote ? (
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            You voted to {' '}
            <span className={`font-medium ${
              userVote.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
            }`}>
              {userVote.vote_type}
            </span>
            {' '} this request
          </p>
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => onVote(request.id, 'approve')}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onVote(request.id, 'reject')}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  );
};