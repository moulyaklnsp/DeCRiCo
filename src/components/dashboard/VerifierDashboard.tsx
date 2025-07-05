import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp, Users, Vote, Loader2 } from 'lucide-react';
import { Request } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const VerifierDashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
    fetchMyVotes();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:users!requester_id(username, email),
          votes(
            *,
            voter:users!voter_id(username, role)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVotes = async () => {
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
      setMyVotes(data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const handleVote = async (requestId: string, voteType: 'approve' | 'reject') => {
    if (!user) return;

    setVoting(requestId);
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

      toast.success(`Request ${voteType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      // Refresh data
      await Promise.all([fetchRequests(), fetchMyVotes()]);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to cast vote');
    } finally {
      setVoting(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const stats = {
    totalRequests: requests.length,
    pendingRequests: pendingRequests.length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
    myVotes: myVotes.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading verifier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Verifier Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Review and verify donation requests to maintain platform integrity
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Requests</p>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Review</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Approved</p>
              <p className="text-2xl font-bold">{stats.approvedRequests}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">My Votes</p>
              <p className="text-2xl font-bold">{stats.myVotes}</p>
            </div>
            <Vote className="w-10 h-10 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Requests (Need Your Review)</h2>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending requests need your review at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request, index) => (
              <VoteCard
                key={request.id}
                request={request}
                onVote={handleVote}
                userVote={myVotes.find(v => v.request_id === request.id)}
                index={index}
                voting={voting === request.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Requests */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request, index) => (
            <RequestSummaryCard
              key={request.id}
              request={request}
              userVote={myVotes.find(v => v.request_id === request.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface VoteCardProps {
  request: Request;
  onVote: (requestId: string, voteType: 'approve' | 'reject') => void;
  userVote?: any;
  index: number;
  voting: boolean;
}

const VoteCard: React.FC<VoteCardProps> = ({ request, onVote, userVote, index, voting }) => {
  const approveVotes = request.votes?.filter(v => v.vote_type === 'approve').length || 0;
  const rejectVotes = request.votes?.filter(v => v.vote_type === 'reject').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-yellow-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{request.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{request.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>By {request.requester?.username}</span>
            <span>Amount: {request.amount_needed.toFixed(4)} ETH</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 text-sm">
          <span className="text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {approveVotes} Approvals
          </span>
          <span className="text-red-600 flex items-center">
            <XCircle className="w-4 h-4 mr-1" />
            {rejectVotes} Rejections
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
      </div>

      {userVote ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
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
        <div className="flex space-x-3">
          <button
            onClick={() => onVote(request.id, 'approve')}
            disabled={voting}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {voting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </>
            )}
          </button>
          <button
            onClick={() => onVote(request.id, 'reject')}
            disabled={voting}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {voting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

interface RequestSummaryCardProps {
  request: Request;
  userVote?: any;
  index: number;
}

const RequestSummaryCard: React.FC<RequestSummaryCardProps> = ({ request, userVote, index }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const approveVotes = request.votes?.filter(v => v.vote_type === 'approve').length || 0;
  const rejectVotes = request.votes?.filter(v => v.vote_type === 'reject').length || 0;
  const progress = (request.amount_raised / request.amount_needed) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 line-clamp-2">{request.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

      {request.status === 'approved' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Funding Progress</span>
            <span className="text-sm font-medium text-gray-800">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <div className="flex space-x-3">
          <span className="text-green-600">✓ {approveVotes}</span>
          <span className="text-red-600">✗ {rejectVotes}</span>
        </div>
        {userVote && (
          <span className={`font-medium ${
            userVote.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
          }`}>
            You: {userVote.vote_type}
          </span>
        )}
      </div>
    </motion.div>
  );
};