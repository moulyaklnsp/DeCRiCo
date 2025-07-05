import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Heart, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { Request } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export const BrowseRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchTerm, statusFilter, sortBy]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:users!requester_id(id, username, email, wallet_address),
          votes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched requests for browse page:', data); // Debug log
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Sort requests
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'amount_high':
        filtered.sort((a, b) => b.amount_needed - a.amount_needed);
        break;
      case 'amount_low':
        filtered.sort((a, b) => a.amount_needed - b.amount_needed);
        break;
      case 'progress':
        filtered.sort((a, b) => (b.amount_raised / b.amount_needed) - (a.amount_raised / a.amount_needed));
        break;
      case 'urgent':
        filtered.sort((a, b) => {
          const aProgress = a.amount_raised / a.amount_needed;
          const bProgress = b.amount_raised / b.amount_needed;
          const aUrgency = aProgress < 0.5 ? 1 : 0;
          const bUrgency = bProgress < 0.5 ? 1 : 0;
          return bUrgency - aUrgency;
        });
        break;
    }

    setFilteredRequests(filtered);
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

  const getUrgencyLevel = (request: Request) => {
    const progress = request.amount_raised / request.amount_needed;
    if (progress < 0.25) return { level: 'Critical', color: 'text-red-600' };
    if (progress < 0.5) return { level: 'High', color: 'text-orange-600' };
    if (progress < 0.75) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Browse Requests
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Discover verified crisis situations that need your support. 
              Every donation makes a real difference in someone's life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
                <option value="progress">Most Funded</option>
                <option value="urgent">Most Urgent</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        </div>
      </section>

      {/* Requests Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No requests found</h3>
              <p className="text-gray-600 mb-8">
                Try adjusting your search criteria or filters to find more requests.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('newest');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRequests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  index={index}
                  onViewDetails={() => navigate(`/request/${request.id}`)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

interface RequestCardProps {
  request: Request;
  index: number;
  onViewDetails: () => void;
  isAuthenticated: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, index, onViewDetails, isAuthenticated }) => {
  const progress = (request.amount_raised / request.amount_needed) * 100;
  const urgency = getUrgencyLevel(request);

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

  const getUrgencyLevel = (request: Request) => {
    const progress = request.amount_raised / request.amount_needed;
    if (progress < 0.25) return { level: 'Critical', color: 'text-red-600' };
    if (progress < 0.5) return { level: 'High', color: 'text-orange-600' };
    if (progress < 0.75) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{request.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Users className="w-4 h-4" />
              <span>By {request.requester?.username}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            <span className={`text-xs font-medium ${urgency.color}`}>
              {urgency.level} Priority
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{request.description}</p>

        {/* Progress */}
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
              {request.amount_raised.toFixed(4)} ETH
            </span>
            <span className="text-sm font-medium text-gray-800">
              Goal: {request.amount_needed.toFixed(4)} ETH
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{request.votes?.length || 0} votes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mb-2">
            Wallet: {request.requester?.wallet_address ? 'Set' : 'Not set'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50">
        <div className="flex justify-between items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View Details →
          </button>
          {request.status === 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  window.dispatchEvent(new CustomEvent('openAuth'));
                } else {
                  onViewDetails();
                }
              }}
              disabled={!request.requester?.wallet_address}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="w-4 h-4" />
              <span>{!request.requester?.wallet_address ? 'Wallet Not Set' : 'Donate'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};