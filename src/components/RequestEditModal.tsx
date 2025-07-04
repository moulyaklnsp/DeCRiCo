import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, MapPin, AlertTriangle, Image, Link as LinkIcon } from 'lucide-react';
import { useDatabase, AidRequest } from '../contexts/DatabaseContext';

interface RequestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AidRequest;
  onUpdate: () => void;
}

const RequestEditModal: React.FC<RequestEditModalProps> = ({ isOpen, onClose, request, onUpdate }) => {
  const { updateAidRequest } = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: request.title,
    description: request.description,
    location: request.location,
    targetAmount: request.targetAmount,
    contactInfo: request.contactInfo,
    mediaFiles: [...request.mediaFiles],
    externalLinks: [...request.externalLinks],
    proofDocuments: request.proofDocuments || ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setIsSubmitting(true);

    try {
      await updateAidRequest(request.id!, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        targetAmount: formData.targetAmount,
        contactInfo: formData.contactInfo,
        mediaFiles: formData.mediaFiles,
        externalLinks: formData.externalLinks,
        proofDocuments: formData.proofDocuments
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Aid Request</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Target Amount */}
                  <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-300 mb-2">
                      Target Amount (ETH) *
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      required
                      min="0.1"
                      step="0.1"
                      value={formData.targetAmount}
                      onChange={handleInputChange}
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
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

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
                        placeholder="https://example.com/image.jpg"
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

                {/* Notice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium mb-1">Update Notice</p>
                      <p className="text-blue-200">
                        Changes to your request will be visible immediately. Major changes may require 
                        re-verification by the community.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RequestEditModal;