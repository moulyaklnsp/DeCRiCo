import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign,
  FileText,
  Settings,
  Upload,
  Wallet,
  BarChart3,
  Users,
  Target,
  Loader2
} from 'lucide-react';
import { Request, Vote, Donation } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const RequesterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'dashboard' | 'profile'>('requests');
  const [requests, setRequests] = useState<Request[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
    fetchDonations();
  }, []);

  const fetchRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          votes(
            *,
            voter:users!voter_id(username, role)
          )
        `)
        .eq('requester_id', user.id)
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

  const fetchDonations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:users!donor_id(username),
          request:requests!inner(requester_id)
        `)
        .eq('request.requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    }
  };

  const handleCreateRequest = async (requestData: any) => {
    if (!user?.wallet_address) {
      toast.error('Please ensure your wallet address is set in your profile');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('requests')
        .insert([
          {
            ...requestData,
            requester_id: user.id,
            amount_raised: 0,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      toast.success('Request created successfully!');
      setShowCreateForm(false);
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, updates: Partial<Request>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request updated successfully!');
      setEditingRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request deleted successfully!');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalRequests: requests.length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    totalRaised: requests.reduce((sum, r) => sum + r.amount_raised, 0),
    totalDonations: donations.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
  };

  const renderRequestsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Aid Requests</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Create Request</span>
        </button>
      </div>

      {!user?.wallet_address && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Wallet address required:</strong> Please set your wallet address in profile settings to receive donations.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading requests...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <RequestCard
              key={request.id}
              request={request}
              onEdit={setEditingRequest}
              onDelete={handleDeleteRequest}
              index={index}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Funds Received</p>
              <p className="text-2xl font-bold">{stats.totalRaised.toFixed(4)} ETH</p>
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
              <p className="text-blue-100 text-sm">Total Requests</p>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-200" />
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
              <p className="text-purple-100 text-sm">Approved</p>
              <p className="text-2xl font-bold">{stats.approvedRequests}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Donations</p>
              <p className="text-2xl font-bold">{stats.totalDonations}</p>
            </div>
            <Users className="w-10 h-10 text-indigo-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completedRequests}</p>
            </div>
            <Target className="w-10 h-10 text-pink-200" />
          </div>
        </motion.div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Recent Donations Received
        </h3>
        
        <div className="space-y-4">
          {donations.slice(0, 10).map((donation) => (
            <div key={donation.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">From: {donation.donor?.username}</h4>
                  <p className="text-sm text-gray-600">{donation.request?.title}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address (for receiving donations)
            </label>
            <input
              type="text"
              value={user?.wallet_address || 'Not set'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              readOnly
            />
            <p className="text-sm text-gray-500 mt-1">
              Donations will be sent directly to this wallet address
            </p>
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
          Aid Requester Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Create requests, track funding, and manage your aid campaigns
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-white/50 backdrop-blur-lg rounded-xl p-2">
        {[
          { id: 'requests', label: 'My Requests', icon: FileText },
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
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
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Create Request Modal */}
      {showCreateForm && (
        <RequestModal
          onSubmit={handleCreateRequest}
          onClose={() => setShowCreateForm(false)}
          loading={loading}
        />
      )}

      {/* Edit Request Modal */}
      {editingRequest && (
        <RequestModal
          request={editingRequest}
          onSubmit={(data) => handleUpdateRequest(editingRequest.id, data)}
          onClose={() => setEditingRequest(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

interface RequestCardProps {
  request: Request;
  onEdit: (request: Request) => void;
  onDelete: (requestId: string) => void;
  index: number;
  loading: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onEdit, onDelete, index, loading }) => {
  const [showVotes, setShowVotes] = useState(false);
  const progress = (request.amount_raised / request.amount_needed) * 100;

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

  const approveVotes = request.votes?.filter(v => v.vote_type === 'approve') || [];
  const rejectVotes = request.votes?.filter(v => v.vote_type === 'reject') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-800">{request.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{request.description}</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowVotes(!showVotes)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(request)}
            disabled={loading}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(request.id)}
            disabled={loading}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Funding Progress</span>
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

      {/* Voting Stats */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <span className="text-green-600">
            ✓ {approveVotes.length} Approvals
          </span>
          <span className="text-red-600">
            ✗ {rejectVotes.length} Rejections
          </span>
        </div>
        <span className="text-gray-500">
          Created {new Date(request.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Votes Detail */}
      {showVotes && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Voting Details</h4>
          <div className="space-y-2">
            {request.votes?.map((vote) => (
              <div key={vote.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {vote.voter?.username} ({vote.voter?.role})
                </span>
                <span className={`text-sm font-medium ${
                  vote.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {vote.vote_type === 'approve' ? '✓ Approved' : '✗ Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface RequestModalProps {
  request?: Request;
  onSubmit: (data: any) => void;
  onClose: () => void;
  loading: boolean;
}

const RequestModal: React.FC<RequestModalProps> = ({ request, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    title: request?.title || '',
    description: request?.description || '',
    amount_needed: request?.amount_needed || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {request ? 'Edit Request' : 'Create New Aid Request'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Include photos/documentation if available)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your situation, include any supporting documentation or photo links..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Needed (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.amount_needed}
              onChange={(e) => setFormData({ ...formData, amount_needed: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Donations will be sent directly to your wallet address. 
              Make sure your wallet address is set in your profile.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (request ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};