import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const ProposePage: React.FC = () => {
  const { isConnected, balance } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    rationale: '',
    implementation: '',
    timeline: ''
  });

  const categories = [
    { value: 'governance', label: 'Governance' },
    { value: 'funding', label: 'Funding' },
    { value: 'economics', label: 'Economics' },
    { value: 'technical', label: 'Technical' },
    { value: 'community', label: 'Community' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet to submit a proposal');
      return;
    }

    if (parseFloat(balance) < 0.01) {
      alert('Insufficient balance to submit proposal. You need at least 0.01 ETH for gas fees.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save proposal to localStorage
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    const newProposal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      proposer: '0x1234...5678', // In real app, this would be the connected wallet
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      timeLeft: '30 days',
      status: 'active',
      rationale: formData.rationale,
      implementation: formData.implementation,
      timeline: formData.timeline,
      createdAt: new Date().toISOString()
    };
    
    proposals.push(newProposal);
    localStorage.setItem('proposals', JSON.stringify(proposals));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        rationale: '',
        implementation: '',
        timeline: ''
      });
    }, 3000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 text-center"
          >
            <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Wallet Connection Required
            </h2>
            <p className="text-slate-300 mb-6">
              You need to connect your wallet to submit proposals. This ensures all proposals are verified and tied to a blockchain address.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Your wallet address will be used to verify your identity and track proposal ownership.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Proposal Submitted Successfully!
            </h2>
            <p className="text-slate-300 mb-6">
              Your proposal has been submitted to the community for review and voting. 
              It will be available for voting within 24 hours after verification.
            </p>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Proposal ID: #PROP-{Date.now()}</p>
              <p>Status: Under Review</p>
              <p>Voting Period: 30 days (after approval)</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Create Proposal
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Submit a proposal to improve the DeCRiCo platform. Your proposal will be reviewed 
            by the community and put to a vote if approved.
          </p>
        </motion.div>

        {/* Wallet Balance Warning */}
        {parseFloat(balance) < 0.01 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Insufficient Balance ({balance} ETH) - Add funds to submit proposals
              </span>
            </div>
          </motion.div>
        )}

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-cyan-400" />
            Proposal Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Community Impact</h3>
                <p className="text-slate-300">Proposals should benefit the entire DeCRiCo community</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Clear Timeline</h3>
                <p className="text-slate-300">Include realistic implementation timelines</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Detailed Plan</h3>
                <p className="text-slate-300">Provide comprehensive implementation details</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Proposal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Increase verification requirements for large requests"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">
                  Implementation Timeline *
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  required
                  value={formData.timeline}
                  onChange={handleInputChange}
                  placeholder="2-4 weeks"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Brief Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A concise summary of what this proposal aims to achieve..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Rationale */}
              <div className="md:col-span-2">
                <label htmlFor="rationale" className="block text-sm font-medium text-slate-300 mb-2">
                  Rationale & Benefits *
                </label>
                <textarea
                  id="rationale"
                  name="rationale"
                  required
                  rows={4}
                  value={formData.rationale}
                  onChange={handleInputChange}
                  placeholder="Explain why this proposal is needed and how it will benefit the community..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Implementation */}
              <div className="md:col-span-2">
                <label htmlFor="implementation" className="block text-sm font-medium text-slate-300 mb-2">
                  Implementation Plan *
                </label>
                <textarea
                  id="implementation"
                  name="implementation"
                  required
                  rows={5}
                  value={formData.implementation}
                  onChange={handleInputChange}
                  placeholder="Provide detailed steps for how this proposal would be implemented..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-1">Submission Process</p>
                <p className="text-blue-200">
                  After submission, your proposal will be reviewed by moderators for compliance with 
                  community guidelines. Approved proposals will be open for voting for 30 days.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || parseFloat(balance) < 0.01}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Submitting Proposal...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ProposePage;