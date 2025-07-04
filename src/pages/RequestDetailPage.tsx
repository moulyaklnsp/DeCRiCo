import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Users, Shield, ExternalLink, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

const RequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isConnected, address, balance } = useWallet();
  const { getRequestById, donateToRequest, isLoading } = useContract();
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);

  const request = getRequestById(id || '1');

  if (!request) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center"
          >
            <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Request Not Found</h2>
            <p className="text-slate-300 mb-6">The requested aid request could not be found.</p>
            <Link
              to="/requests"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleDonation = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (parseFloat(balance) < 0.01) {
      alert('Insufficient balance for gas fees. You need at least 0.01 ETH.');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (parseFloat(donationAmount) > parseFloat(balance)) {
      alert('Donation amount exceeds your wallet balance');
      return;
    }

    setIsDonating(true);
    
    try {
      await donateToRequest(request.id, donationAmount);
      setShowDonationSuccess(true);
      setDonationAmount('');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowDonationSuccess(false);
      }, 5000);
    } catch (error) {
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsDonating(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const progressPercentage = Math.min((parseFloat(request.raised) / parseFloat(request.target)) * 100, 100);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/requests"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.urgent 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
                  {request.daysLeft} days left
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">
                {request.title}
              </h1>

              <div className="flex items-center text-slate-400 text-sm mb-6">
                <MapPin className="h-4 w-4 mr-1" />
                {request.location}
              </div>

              <div className="prose max-w-none">
                <p className="text-slate-300 leading-relaxed">
                  {request.description}
                </p>
              </div>
            </motion.div>

            {/* Creator Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Creator Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Wallet Address</label>
                  <p className="text-white font-mono text-sm">{formatAddress(request.creator)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Created</label>
                  <p className="text-white">{request.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Status</label>
                  <p className="text-white capitalize">{request.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Category</label>
                  <p className="text-white capitalize">{request.category}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Success Message */}
            {showDonationSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
              >
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-green-400 font-medium">Donation Successful!</h3>
                    <p className="text-green-300 text-sm mt-1">
                      Your donation has been recorded on the blockchain. Thank you for your support!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wallet Balance Warning */}
            {isConnected && parseFloat(balance) < 0.01 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
              >
                <div className="flex items-center text-amber-400">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">
                    Insufficient Balance ({balance} ETH)
                  </span>
                </div>
              </motion.div>
            )}

            {/* Donation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Support This Request</h2>
              
              {/* Progress */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold text-white">{request.raised} ETH</span>
                  <span className="text-slate-400">of {request.target} ETH</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1 }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{Math.round(progressPercentage)}% funded</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {request.contributors} contributors
                  </div>
                </div>
              </div>

              {/* Donation Form */}
              {isConnected && parseFloat(balance) >= 0.01 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Donation Amount (ETH)
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      max={balance}
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.1"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Available: {balance} ETH
                    </p>
                  </div>
                  <button
                    onClick={handleDonation}
                    disabled={isDonating || !donationAmount || isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isDonating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Donate Now
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    Funds are sent directly to the creator's wallet
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-4">
                    {!isConnected 
                      ? 'Connect your wallet to donate to this request'
                      : 'Insufficient balance to make donations'
                    }
                  </p>
                  <button 
                    disabled
                    className="w-full px-4 py-3 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                  >
                    {!isConnected ? 'Connect Wallet to Donate' : 'Insufficient Balance'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;