import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, AlertTriangle, CheckCircle, X, Eye, Settings, Activity, ArrowUpRight, Edit, Trash2 } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { getAllTransactions, getTotalVolume, getTransactionsByType } = useTransactions();
  const { getAllUsers, getAllAidRequests, getAllProposals } = useDatabase();

  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const usersData = await getAllUsers();
      const requestsData = await getAllAidRequests();
      const proposalsData = await getAllProposals();
      
      setUsers(usersData);
      setRequests(requestsData);
      setProposals(proposalsData);
    };
    
    loadData();
  }, []);

  const allTransactions = getAllTransactions();
  const totalVolume = getTotalVolume();
  const donationTransactions = getTransactionsByType('donation');
  const requestTransactions = getTransactionsByType('request_creation');

  const stats = [
    { label: 'Total Users', value: users.length.toString(), change: '+12%', icon: Users, color: 'text-blue-400' },
    { label: 'Active Requests', value: requests.filter(r => r.status === 'active').length.toString(), change: '+3 today', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Total Volume', value: `${totalVolume.toFixed(2)} SEP`, change: '+8.2 SEP', icon: Shield, color: 'text-purple-400' },
    { label: 'Platform Transactions', value: allTransactions.length.toString(), change: `+${allTransactions.filter(tx => new Date(tx.timestamp) > new Date(Date.now() - 86400000)).length} today`, icon: Activity, color: 'text-orange-400' }
  ];

  const pendingRequests = requests.filter(r => r.status === 'active' && !r.verified).slice(0, 5);

  const recentActivity = [
    { type: 'verification', message: 'Request #1234 verified by admin', time: '10 minutes ago' },
    { type: 'donation', message: 'Large donation of 5.2 SEP received', time: '25 minutes ago' },
    { type: 'user', message: 'New user registered: 0xabcd...efgh', time: '1 hour ago' },
    { type: 'alert', message: 'Suspicious activity detected on request #5678', time: '2 hours ago' }
  ];

  const recentTransactions = allTransactions.slice(0, 10);

  const handleVerifyRequest = async (requestId: string, action: 'approve' | 'reject') => {
    console.log(`${action} request ${requestId}`);
    // Implement verification logic
  };

  const handleEditRequest = (requestId: string) => {
    console.log(`Edit request ${requestId}`);
    // Implement edit logic
  };

  const handleDeleteRequest = (requestId: string) => {
    console.log(`Delete request ${requestId}`);
    // Implement delete logic
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'donation':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'user':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Manage platform operations and community oversight</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/transactions"
              className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Activity className="h-4 w-4 mr-2" />
              View All Transactions
            </Link>
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-medium">Administrator</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-xs text-slate-400">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'User Management' },
                { id: 'requests', label: 'Request Management' },
                { id: 'proposals', label: 'Proposal Management' },
                { id: 'settings', label: 'Platform Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.message}</p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">Review Pending Verifications</span>
                      </div>
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">{pendingRequests.length}</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-white">Manage User Reports</span>
                      </div>
                      <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">2</span>
                    </button>
                    
                    <Link
                      to="/transactions"
                      className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-purple-400" />
                        <span className="text-white">Monitor All Transactions</span>
                      </div>
                    </Link>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-purple-400" />
                        <span className="text-white">Platform Configuration</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <span className="text-sm text-slate-400">{users.length} total users</span>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-slate-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl border-2 border-cyan-500/30"
                          />
                          <div>
                            <h4 className="text-lg font-medium text-white">{user.name}</h4>
                            <p className="text-sm text-slate-400">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                {user.userType}
                              </span>
                              {user.verified && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-300">Rep: {user.reputation}</span>
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Request Management</h3>
                  <span className="text-sm text-slate-400">{requests.length} total requests</span>
                </div>

                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="bg-slate-700/30 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">{request.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>Creator: {formatAddress(request.creator)}</span>
                            <span>Amount: {request.targetAmount} SEP</span>
                            <span>Status: {request.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!request.verified && (
                            <>
                              <button
                                onClick={() => handleVerifyRequest(request.id, 'approve')}
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerifyRequest(request.id, 'reject')}
                                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">{request.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals Tab */}
            {activeTab === 'proposals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Proposal Management</h3>
                  <span className="text-sm text-slate-400">{proposals.length} total proposals</span>
                </div>

                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-slate-700/30 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">{proposal.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>Proposer: {formatAddress(proposal.proposer)}</span>
                            <span>Category: {proposal.category}</span>
                            <span>Status: {proposal.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-400">For: {proposal.votesFor || 0}</span>
                        <span className="text-red-400">Against: {proposal.votesAgainst || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Platform Settings</h3>
                <div className="bg-slate-700/30 rounded-lg p-6 text-center">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">Platform configuration panel coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;