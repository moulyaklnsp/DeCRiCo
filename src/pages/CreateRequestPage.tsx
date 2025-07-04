import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, MapPin, AlertTriangle, CheckCircle, Image, FileText, Link as LinkIcon } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { createRequest, isLoading } = useContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    target: '',
    urgent: false,
    daysLeft: 30,
    contactInfo: '',
    proofDocuments: '',
    mediaFiles: [] as string[],
    externalLinks: [] as string[]
  });

  const [mediaInput, setMediaInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const categories = [
    { value: 'emergency', label: 'Emergency Relief', icon: '🚨' },
    { value: 'medical', label: 'Medical Aid', icon: '🏥' },
    { value: 'housing', label: 'Housing & Shelter', icon: '🏠' },
    { value: 'food', label: 'Food & Water', icon: '🍽️' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'infrastructure', label: 'Infrastructure Repair', icon: '🔧' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addMediaFile = () => {
    if (mediaInput.trim() && !formData.mediaFiles.includes(mediaInput.trim())) {
      setFormData(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, mediaInput.trim()]
      }));
      setMediaInput('');
    }
  };

  const removeMediaFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const addExternalLink = () => {
    if (linkInput.trim() && !formData.externalLinks.includes(linkInput.trim())) {
      setFormData(prev => ({
        ...prev,
        externalLinks: [...prev.externalLinks, linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

  const removeExternalLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestId = await createRequest({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        target: formData.target,
        urgent: formData.urgent,
        daysLeft: formData.daysLeft,
        verified: false
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form and redirect after success message
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          target: '',
          urgent: false,
          daysLeft: 30,
          contactInfo: '',
          proofDocuments: '',
          mediaFiles: [],
          externalLinks: []
        });
        navigate('/dashboard?tab=requests');
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      alert('Failed to create request. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center"
          >
            <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Wallet Connection Required
            </h2>
            <p className="text-slate-300 mb-6">
              You need to connect your wallet to create aid requests. This ensures all requests are verified and tied to a blockchain address.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Your wallet address will be used to verify your identity and manage your requests.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              Connect Wallet to Continue
            </button>
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
            className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center"
          >
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Request Created Successfully!
            </h2>
            <p className="text-slate-300 mb-6">
              Your aid request has been submitted and is now live for the community to support. It will appear in your dashboard and be available for donations.
            </p>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Request ID: #{Date.now()}</p>
              <p>Status: Active</p>
              <p>Verification: Pending Community Review</p>
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
            Create Aid Request
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Submit a verified request for disaster aid. All requests are recorded on-chain for full transparency.
          </p>
        </motion.div>

        {/* Connected Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300 font-medium">Wallet Connected:</span>
            <span className="text-green-200 ml-2 font-mono">{address}</span>
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
            <h2 className="text-xl font-semibold text-white mb-6">Request Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Request Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Emergency food supplies for earthquake victims"
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
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority Level
                </label>
                <label className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleInputChange}
                    className="rounded text-red-500 focus:ring-red-500"
                  />
                  <span className="text-slate-300">🚨 Mark as Urgent</span>
                </label>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Target Amount */}
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-slate-300 mb-2">
                  Target Amount (ETH) *
                </label>
                <input
                  type="number"
                  id="target"
                  name="target"
                  required
                  min="0.1"
                  step="0.1"
                  value={formData.target}
                  onChange={handleInputChange}
                  placeholder="10.0"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the aid needed, including specific items, quantities, and how the funds will be used..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2">
                <label htmlFor="contactInfo" className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Information *
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  required
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="Email or telegram for verification purposes"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Media and Documentation Section */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Media & Documentation</h2>
            
            <div className="space-y-6">
              {/* Media Files */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Media Files (Images/Videos)
                </label>
                <div className="flex space-x-2 mb-3">
                  <div className="relative flex-1">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="url"
                      value={mediaInput}
                      onChange={(e) => setMediaInput(e.target.value)}
                      placeholder="https://example.com/image.jpg or IPFS hash"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMediaFile}
                    className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.mediaFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.mediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300 text-sm font-mono">{file}</span>
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* External Links */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  External Links (News Articles, Reports)
                </label>
                <div className="flex space-x-2 mb-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="https://news.example.com/disaster-report"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addExternalLink}
                    className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.externalLinks.length > 0 && (
                  <div className="space-y-2">
                    {formData.externalLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                        >
                          {link}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExternalLink(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proof Documents */}
              <div>
                <label htmlFor="proofDocuments" className="block text-sm font-medium text-slate-300 mb-2">
                  Supporting Documentation
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors duration-200">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-300 mb-2">Upload documents or provide IPFS hash</p>
                  <p className="text-xs text-slate-400 mb-4">Documents will be stored on IPFS for transparency</p>
                  <input
                    type="text"
                    id="proofDocuments"
                    name="proofDocuments"
                    value={formData.proofDocuments}
                    onChange={handleInputChange}
                    placeholder="IPFS hash or external link to documentation"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Verification Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Verification Process</p>
                    <p className="text-blue-200">
                      All requests undergo community verification. Providing detailed documentation, 
                      media files, and contact information helps establish credibility and increases funding success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting || isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Creating Request...
                </>
              ) : (
                'Create Aid Request'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateRequestPage;