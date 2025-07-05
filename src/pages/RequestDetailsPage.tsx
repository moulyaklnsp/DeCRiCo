import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye,
  Share2,
  Flag,
  Wallet,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Request, Vote, Donation } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { walletService } from '../lib/wallet';
import toast from 'react-hot-toast';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [voting, setVoting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
      fetchDonations();
      if (user) {
        fetchUserVote();
      }
    }
  }, [id, user]);

  const fetchRequestDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:users!requester_id(id, username, email, wallet_address),
          votes(
            *,
            voter:users!voter_id(username, role)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log('Fetched request details:', data); // Debug log
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Request not found');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:users!donor_id(username)
        `)
        .eq('request_id', id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchUserVote = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('request_id', id)
        .eq('voter_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserVote(data);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const handleVote = async (voteType: 'approve' | 'reject') => {
    if (!user || !isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    if (user.role !== 'verifier' && user.role !== 'admin') {
      toast.error('Only verifiers can vote on requests');
      return;
    }

    if (userVote) {
      toast.error('You have already voted on this request');
      return;
    }

    setVoting(true);
    try {
      const { error } = await supabase
        .from('votes')
        .insert([
          {
            request_id: id,
            voter_id: user.id,
            vote_type: voteType,
          },
        ]);

      if (error) throw error;

      toast.success(`Request ${voteType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      // Refresh data
      await Promise.all([fetchRequestDetails(), fetchUserVote()]);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleDonate = async () => {
    if (!user?.wallet_address) {
      toast.error('Please update your wallet address in profile settings');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!request?.requester) {
      toast.error('Requester information not found');
      return;
    }

    if (!request.requester.wallet_address) {
      toast.error('Requester wallet address not set. Please contact the requester to update their wallet address.');
      return;
    }

    console.log('Donation details:', {
      requesterWallet: request.requester.wallet_address,
      amount: donationAmount,
      requester: request.requester
    }); // Debug log

    setDonating(true);
    try {
      // Send transaction via MetaMask
      const txHash = await walletService.sendTransaction(
        request.requester.wallet_address,
        donationAmount
      );

      if (!txHash) {
        throw new Error('Transaction failed');
      }

      // Save donation to database
      const { error } = await supabase
        .from('donations')
        .insert([
          {
            request_id: id,
            donor_id: user.id,
            amount: parseFloat(donationAmount),
            transaction_hash: txHash,
            status: 'completed',
          },
        ]);

      if (error) throw error;

      toast.success('Donation sent successfully!');
      setDonationAmount('');
      setShowDonationForm(false);
      
      // Refresh data
      await Promise.all([fetchRequestDetails(), fetchDonations()]);
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to send donation');
    } finally {
      setDonating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const shareRequest = () => {
    if (navigator.share) {
      navigator.share({
        title: request?.title,
        text: request?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Request not found</h2>
          <button
            onClick={() => navigate('/browse')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const progress = (request.amount_raised / request.amount_needed) * 100;
  const approveVotes = request.votes?.filter(v => v.vote_type === 'approve') || [];
  const rejectVotes = request.votes?.filter(v => v.vote_type === 'reject') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/browse')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Browse</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={shareRequest}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Flag className="w-5 h-5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Request Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">{request.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>By {request.requester?.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{request.description}</p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">Funding Progress</span>
                  <span className="text-lg font-bold text-gray-800">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-lg text-gray-600">
                    {request.amount_raised.toFixed(4)} ETH raised
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    Goal: {request.amount_needed.toFixed(4)} ETH
                  </span>
                </div>
              </div>

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-600">
                    Debug: Requester wallet - {request.requester?.wallet_address || 'Not set'}
                  </p>
                </div>
              )}

              {/* Voting Section for Verifiers */}
              {user && (user.role === 'verifier' || user.role === 'admin') && request.status === 'pending' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Voting</h3>
                  {userVote ? (
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <p className="text-gray-600">
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
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleVote('approve')}
                        disabled={voting}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {voting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Approve Request</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleVote('reject')}
                        disabled={voting}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {voting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span>Reject Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Voting Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Verification Status</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{approveVotes.length}</div>
                  <div className="text-gray-600">Approve Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">{rejectVotes.length}</div>
                  <div className="text-gray-600">Reject Votes</div>
                </div>
              </div>

              {request.votes && request.votes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Voting Details</h3>
                  {request.votes.map((vote) => (
                    <div key={vote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">
                        {vote.voter?.username} ({vote.voter?.role})
                      </span>
                      <span className={`font-medium ${
                        vote.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {vote.vote_type === 'approve' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Donations */}
            {donations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Donations</h2>
                <div className="space-y-4">
                  {donations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{donation.donor?.username}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{donation.amount.toFixed(4)} ETH</div>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${donation.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>View TX</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            {request.status === 'approved' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h3>
                
                {!request.requester?.wallet_address && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Wallet not set:</strong> The requester needs to update their wallet address to receive donations.
                    </p>
                  </div>
                )}
                
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign in to make a donation</p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                ) : !showDonationForm ? (
                  <button
                    onClick={() => setShowDonationForm(true)}
                    disabled={!request.requester?.wallet_address}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Heart className="w-5 h-5" />
                    <span>{!request.requester?.wallet_address ? 'Wallet Not Set' : 'Donate Now'}</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.1"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDonate}
                        disabled={donating}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {donating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setShowDonationForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Request Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Request Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Donations</span>
                  <span className="font-semibold">{donations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Votes</span>
                  <span className="font-semibold">{request.votes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold">{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold">{new Date(request.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Requester Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Requester Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Username</span>
                  <div className="font-semibold">{request.requester?.username}</div>
                </div>
                {request.requester?.wallet_address && (
                  <div>
                    <span className="text-gray-600">Wallet Address</span>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                      {request.requester.wallet_address}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};