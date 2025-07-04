import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, Zap, TrendingUp, Heart, Globe, Star, Award, Target, Vote, Plus, ChevronDown } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../contexts/ContractContext';

const HomePage: React.FC = () => {
  const { isConnected, balance } = useWallet();
  const { isAuthenticated } = useAuth();
  const { requests } = useContract();
  const [showProposals, setShowProposals] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Transparent & Trustless',
      description: 'All transactions are recorded on-chain with full transparency. No intermediaries, no hidden fees.',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Verified contributors can request aid while donors collectively decide on priority funding.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Instant Distribution',
      description: 'Direct peer-to-peer transfers with smart contract automation for immediate aid distribution.',
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  const stats = [
    { 
      label: 'Total Donated', 
      value: `${requests.reduce((sum, r) => sum + parseFloat(r.raised), 0).toFixed(2)} ETH`, 
      subtext: `~$${(requests.reduce((sum, r) => sum + parseFloat(r.raised), 0) * 2400).toFixed(0)} USD`, 
      icon: Heart 
    },
    { 
      label: 'Active Requests', 
      value: requests.filter(r => r.status === 'active').length.toString(), 
      subtext: 'Across 6 regions', 
      icon: Target 
    },
    { 
      label: 'Requests Fulfilled', 
      value: requests.filter(r => r.status === 'completed').length.toString(), 
      subtext: '+23% this month', 
      icon: Award 
    },
    { 
      label: 'Contributors', 
      value: '1,247', 
      subtext: 'Growing community', 
      icon: Users 
    }
  ];

  // Sample proposals for homepage
  const proposals = [
    {
      id: '1',
      title: 'Increase Verification Requirements',
      description: 'Require additional documentation for requests above 10 ETH',
      votesFor: 1247,
      votesAgainst: 342,
      status: 'active'
    },
    {
      id: '2',
      title: 'Emergency Response Fund',
      description: 'Create community-managed emergency fund for rapid response',
      votesFor: 892,
      votesAgainst: 156,
      status: 'active'
    },
    {
      id: '3',
      title: 'Platform Fee Reduction',
      description: 'Reduce platform fees from 2% to 1.5%',
      votesFor: 2156,
      votesAgainst: 234,
      status: 'passed'
    }
  ];

  const featuredRequests = requests.filter(r => r.status === 'active').slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-20 relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                Powered by Ethereum Blockchain
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Transparent Disaster Aid
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Built on Blockchain
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              DeCRiCo enables transparent, decentralized disaster relief coordination. 
              Connect verified aid requests with donors through trustless smart contracts on Ethereum.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/requests"
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-cyan-500/25"
                  >
                    Browse Aid Requests
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/create"
                    className="inline-flex items-center px-8 py-4 border-2 border-slate-600 text-slate-300 rounded-xl hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-300 font-medium text-lg"
                  >
                    Create Request
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-cyan-500/25"
                  >
                    Explore Platform
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    to="/requests"
                    className="inline-flex items-center px-8 py-4 border-2 border-slate-600 text-slate-300 rounded-xl hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-300 font-medium text-lg"
                  >
                    View Active Requests
                  </Link>
                </>
              )}
            </motion.div>

            {/* Wallet Balance Warning */}
            {isConnected && parseFloat(balance) < 0.01 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8 max-w-md mx-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
              >
                <div className="flex items-center text-amber-400">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">
                    Insufficient Balance - Add ETH to participate in donations
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full opacity-60" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-300 mb-1">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.subtext}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose DeCRiCo?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Built on Ethereum for maximum transparency, security, and community governance
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Requests Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-900/20 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-2">
                Featured Aid Requests
              </h2>
              <p className="text-xl text-slate-300">
                Urgent requests that need immediate support
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/requests"
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-lg group"
              >
                View All Requests
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.urgent 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {request.urgent ? 'URGENT' : request.category.toUpperCase()}
                  </span>
                  <div className="flex items-center text-slate-400 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {request.contributors}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {request.title}
                </h3>
                <p className="text-slate-300 text-sm mb-6 line-clamp-3">
                  {request.description}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-white">
                      {request.raised} / {request.target} ETH
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(parseFloat(request.raised) / parseFloat(request.target)) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                    />
                  </div>
                  <Link
                    to={`/request/${request.id}`}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium group-hover:shadow-lg group-hover:shadow-cyan-500/25"
                  >
                    Donate Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Governance Proposals Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-2">
                Community Governance
              </h2>
              <p className="text-xl text-slate-300">
                Active proposals shaping the platform's future
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <button
                onClick={() => setShowProposals(!showProposals)}
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-lg group"
              >
                <Vote className="mr-2 h-5 w-5" />
                View Proposals
                <ChevronDown className={`ml-2 h-5 w-5 transition-transform ${showProposals ? 'rotate-180' : ''}`} />
              </button>
              
              {showProposals && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700 shadow-xl z-10"
                >
                  <div className="p-4">
                    <div className="space-y-3">
                      {proposals.slice(0, 3).map((proposal) => (
                        <div key={proposal.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <h4 className="font-medium text-white text-sm mb-1">{proposal.title}</h4>
                          <p className="text-slate-300 text-xs mb-2">{proposal.description}</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">For: {proposal.votesFor}</span>
                            <span className="text-red-400">Against: {proposal.votesAgainst}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-600">
                      <Link
                        to="/vote"
                        className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium text-sm"
                      >
                        View All & Vote
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {proposals.slice(0, 3).map((proposal, index) => (
              <motion.div
                key={proposal.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'active' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {proposal.status.toUpperCase()}
                  </span>
                  <Vote className="h-5 w-5 text-purple-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{proposal.title}</h3>
                <p className="text-slate-300 text-sm mb-4">{proposal.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">For: {proposal.votesFor}</span>
                    <span className="text-red-400">Against: {proposal.votesAgainst}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5" />
            <div className="relative">
              <Globe className="h-20 w-20 mx-auto mb-8 text-cyan-400" />
              <h2 className="text-4xl font-bold text-white mb-6">
                Join the Decentralized Relief Network
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Connect your wallet to start making a transparent impact in disaster relief efforts worldwide.
              </p>
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/requests"
                    className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
                  >
                    Explore Without Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;