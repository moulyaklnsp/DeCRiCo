import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Heart, Clock, Users, Shield, Edit, Trash2, ExternalLink, Settings, User, Camera, Save } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../contexts/ContractContext';

const DashboardPage: React.FC = () => {
  const { isConnected, address, balance } = useWallet();
  const { user, updateUserType } = useAuth();
  const { getUserRequests, getUserDonations } = useContract();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: '',
        location: '',
        website: ''
      });
    }
  }, [user]);

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center"
          >
            <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-slate-300 mb-6">
              Access your personal dashboard by connecting your wallet. View your requests, donations, and reputation.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium">
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const userRequests = getUserRequests(address!);
  const userDonations = getUserDonations(address!);

  const getStatsForUserType = () => {
    switch (user.userType) {
      case 'donor':
        return [
          { 
            label: 'Total Donated', 
            value: `${userDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0).toFixed(2)} ETH`, 
            change: '+23%', 
            icon: Heart, 
            color: 'text-emerald-600' 
          },
          { 
            label: 'Communities Helped', 
            value: userDonations.length.toString(), 
            change: '+2 recent', 
            icon: Users, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Reputation Score', 
            value: `${user.reputation}/5`, 
            change: '⭐ Top 10%', 
            icon: TrendingUp, 
            color: 'text-purple-600' 
          },
          { 
            label: 'Impact Score', 
            value: `${userDonations.length * 15}`, 
            change: 'People helped', 
            icon: Shield, 
            color: 'text-orange-600' 
          }
        ];

      case 'requester':
        return [
          { 
            label: 'Requests Created', 
            value: userRequests.length.toString(), 
            change: '+1 this month', 
            icon: Plus, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Total Raised', 
            value: `${userRequests.reduce((sum, r) => sum + parseFloat(r.raised), 0).toFixed(2)} ETH`, 
            change: '+15%', 
            icon: TrendingUp, 
            color: 'text-emerald-600' 
          },
          { 
            label: 'Active Requests', 
            value: userRequests.filter(r => r.status === 'active').length.toString(), 
            change: 'Currently funding', 
            icon: Clock, 
            color: 'text-orange-600' 
          },
          { 
            label: 'Success Rate', 
            value: `${userRequests.length > 0 ? Math.round((userRequests.filter(r => r.status === 'completed').length / userRequests.length) * 100) : 0}%`, 
            change: 'Completion rate', 
            icon: Shield, 
            color: 'text-purple-600' 
          }
        ];

      case 'verifier':
        return [
          { 
            label: 'Verifications', 
            value: '47', 
            change: '+5 this week', 
            icon: Shield, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Accuracy Rate', 
            value: '98%', 
            change: 'High accuracy', 
            icon: TrendingUp, 
            color: 'text-emerald-600' 
          },
          { 
            label: 'Pending Reviews', 
            value: '3', 
            change: 'Awaiting review', 
            icon: Clock, 
            color: 'text-orange-600' 
          },
          { 
            label: 'Reputation', 
            value: `${user.reputation}/5`, 
            change: '⭐ Expert level', 
            icon: Users, 
            color: 'text-purple-600' 
          }
        ];

      case 'admin':
        return [
          { 
            label: 'Platform Users', 
            value: '1,247', 
            change: '+12% growth', 
            icon: Users, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Total Volume', 
            value: '127.3 ETH', 
            change: '+8.2 ETH', 
            icon: TrendingUp, 
            color: 'text-emerald-600' 
          },
          { 
            label: 'Active Requests', 
            value: '18', 
            change: '+3 today', 
            icon: Plus, 
            color: 'text-orange-600' 
          },
          { 
            label: 'System Health', 
            value: '99.9%', 
            change: 'Uptime', 
            icon: Shield, 
            color: 'text-purple-600' 
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForUserType();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleProfileSave = () => {
    // In a real app, this would update the user profile
    setEditingProfile(false);
    // You could call an API here to update the profile
  };

  const getTabsForUserType = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'settings', label: 'Profile Settings' }
    ];

    switch (user.userType) {
      case 'donor':
        return [
          ...baseTabs.slice(0, 1),
          { id: 'donations', label: 'My Donations' },
          { id: 'impact', label: 'Impact Report' },
          ...baseTabs.slice(1)
        ];

      case 'requester':
        return [
          ...baseTabs.slice(0, 1),
          { id: 'requests', label: 'My Requests' },
          { id: 'history', label: 'Request History' },
          ...baseTabs.slice(1)
        ];

      case 'verifier':
        return [
          ...baseTabs.slice(0, 1),
          { id: 'verifications', label: 'Verifications' },
          { id: 'history', label: 'Verification History' },
          ...baseTabs.slice(1)
        ];

      case 'admin':
        return [
          ...baseTabs.slice(0, 1),
          { id: 'analytics', label: 'Analytics' },
          { id: 'management', label: 'User Management' },
          ...baseTabs.slice(1)
        ];

      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForUserType();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} Dashboard
              </h1>
              <p className="text-slate-300">
                Welcome back, {user.name} • Balance: {balance} ETH
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-sm">Role: </span>
                <span className="text-cyan-400 font-medium capitalize">{user.userType}</span>
              </div>
              {user.verified && (
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center text-green-400 text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                </div>
              )}
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
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-xs text-slate-400">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {user.userType === 'donor' && userDonations.slice(0, 3).map((donation, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                          <Heart className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Donated {donation.amount} ETH</p>
                            <p className="text-xs text-slate-400">Request #{donation.requestId} • {new Date(donation.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      
                      {user.userType === 'requester' && userRequests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                          <Plus className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{request.title}</p>
                            <p className="text-xs text-slate-400">{request.raised}/{request.target} ETH raised • {request.createdAt}</p>
                          </div>
                        </div>
                      ))}

                      {(user.userType === 'verifier' || user.userType === 'admin') && (
                        <>
                          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                            <Shield className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Verified 3 requests</p>
                              <p className="text-xs text-slate-400">Today • All approved</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                            <Users className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Platform activity</p>
                              <p className="text-xs text-slate-400">12 new users joined today</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {user.userType === 'donor' && (
                        <>
                          <Link
                            to="/requests"
                            className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Heart className="h-5 w-5 text-emerald-400" />
                              <span className="text-white">Browse Requests to Donate</span>
                            </div>
                          </Link>
                          <Link
                            to="/vote"
                            className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <TrendingUp className="h-5 w-5 text-purple-400" />
                              <span className="text-white">Vote on Proposals</span>
                            </div>
                          </Link>
                        </>
                      )}

                      {user.userType === 'requester' && (
                        <>
                          <Link
                            to="/create"
                            className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Plus className="h-5 w-5 text-blue-400" />
                              <span className="text-white">Create New Request</span>
                            </div>
                          </Link>
                          <button className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors text-left">
                            <div className="flex items-center space-x-3">
                              <Edit className="h-5 w-5 text-green-400" />
                              <span className="text-white">Update Active Requests</span>
                            </div>
                          </button>
                        </>
                      )}

                      {(user.userType === 'verifier' || user.userType === 'admin') && (
                        <>
                          <Link
                            to="/admin?tab=verifications"
                            className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Shield className="h-5 w-5 text-blue-400" />
                              <span className="text-white">Review Pending Requests</span>
                            </div>
                          </Link>
                          <Link
                            to="/propose"
                            className="block w-full p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Plus className="h-5 w-5 text-purple-400" />
                              <span className="text-white">Create Proposal</span>
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Profile Picture */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-4 border-cyan-500/30 object-cover"
                        />
                        {editingProfile && (
                          <button className="absolute bottom-0 right-0 p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors">
                            <Camera className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={address!}
                        readOnly
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 font-mono text-sm text-white opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editingProfile}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Notification Preferences
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-cyan-500 mr-2" defaultChecked disabled={!editingProfile} />
                          <span className="text-sm text-slate-300">Email notifications for donations</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-cyan-500 mr-2" defaultChecked disabled={!editingProfile} />
                          <span className="text-sm text-slate-300">Updates on requests I've donated to</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-cyan-500 mr-2" disabled={!editingProfile} />
                          <span className="text-sm text-slate-300">Weekly impact reports</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {editingProfile && (
                  <div className="flex space-x-4 pt-6 border-t border-slate-600">
                    <button
                      onClick={handleProfileSave}
                      className="flex items-center px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Role-specific tabs content would go here */}
            {activeTab === 'requests' && user.userType === 'requester' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">My Aid Requests</h3>
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Request
                  </Link>
                </div>

                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">{request.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/request/${request.id}`}
                            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-600/50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-slate-400">Target</label>
                          <p className="font-medium text-white">{request.target} ETH</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Raised</label>
                          <p className="font-medium text-white">{request.raised} ETH</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Contributors</label>
                          <p className="font-medium text-white">{request.contributors}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Days Left</label>
                          <p className="font-medium text-white">
                            {request.daysLeft > 0 ? `${request.daysLeft} days` : 'Completed'}
                          </p>
                        </div>
                      </div>

                      {request.status === 'active' && (
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((parseFloat(request.raised) / parseFloat(request.target)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {userRequests.length === 0 && (
                    <div className="text-center py-8">
                      <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300 mb-4">You haven't created any requests yet</p>
                      <Link
                        to="/create"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
                      >
                        Create Your First Request
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add other role-specific tab content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;