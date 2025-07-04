import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, TrendingUp, Clock, MapPin, Shield } from 'lucide-react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';

const DonatePage: React.FC = () => {
  const { requests } = useContract();
  const { isConnected } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('urgent');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'medical', label: 'Medical' },
    { value: 'housing', label: 'Housing' },
    { value: 'food', label: 'Food & Water' },
    { value: 'education', label: 'Education' },
    { value: 'infrastructure', label: 'Infrastructure' }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    return matchesCategory && request.status === 'active';
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'urgent':
        return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      case 'progress':
        return (parseFloat(b.raised) / parseFloat(b.target)) - (parseFloat(a.raised) / parseFloat(a.target));
      case 'ending':
        return a.daysLeft - b.daysLeft;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-700',
      medical: 'bg-blue-100 text-blue-700',
      housing: 'bg-purple-100 text-purple-700',
      food: 'bg-green-100 text-green-700',
      education: 'bg-yellow-100 text-yellow-700',
      infrastructure: 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Make a Difference Today
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Support verified disaster relief requests from communities around the world. 
            Every donation is tracked transparently on the blockchain.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-red-400" />
              <span className="text-xs text-slate-400">Total Impact</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">127.3 ETH</div>
            <div className="text-sm text-slate-300">Donated to date</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-xs text-slate-400">Community</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">1,247</div>
            <div className="text-sm text-slate-300">Active donors</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-xs text-slate-400">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">94%</div>
            <div className="text-sm text-slate-300">Requests fulfilled</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="urgent">Most Urgent</option>
                <option value="progress">Most Funded</option>
                <option value="ending">Ending Soon</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.urgent 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : getCategoryColor(request.category)
                  }`}>
                    {request.urgent ? 'URGENT' : request.category.toUpperCase()}
                  </span>
                  {request.verified && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center border border-green-500/30">
                      <Shield className="h-3 w-3 mr-1" />
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {request.daysLeft}d left
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                {request.title}
              </h3>
              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                {request.description}
              </p>

              {/* Location */}
              <div className="flex items-center text-slate-400 text-sm mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {request.location}
              </div>

              {/* Progress */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-medium text-white">
                    {request.raised} / {request.target} ETH
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min((parseFloat(request.raised) / parseFloat(request.target)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{Math.round((parseFloat(request.raised) / parseFloat(request.target)) * 100)}% funded</span>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {request.contributors} contributors
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/request/${request.id}`}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium group-hover:shadow-lg group-hover:shadow-cyan-500/25"
              >
                {isConnected ? 'Donate Now' : 'View Details'}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No active requests found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your filters or check back later for new requests.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              Create New Request
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DonatePage;