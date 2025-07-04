import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Wallet, LogOut, User, Settings, ChevronDown, Heart, Plus, Vote, FileText, Users, BarChart3 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import NetworkSwitcher from './NetworkSwitcher';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet, isLoading, network } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();

  // Role-based navigation
  const getNavigationForRole = () => {
    if (!user) return [];

    const baseNavigation = [
      { name: 'Home', href: '/', icon: Shield }
    ];

    switch (user.userType) {
      case 'donor':
        return [
          ...baseNavigation.slice(0, 1),
          { 
            name: 'Donate', 
            href: '/donate', 
            icon: Heart,
            dropdown: [
              { name: 'Browse Requests', href: '/requests' },
              { name: 'My Donations', href: '/dashboard?tab=donations' },
              { name: 'Impact Report', href: '/dashboard?tab=impact' }
            ]
          },
          { 
            name: 'Governance', 
            href: '/vote', 
            icon: Vote,
            dropdown: [
              { name: 'Vote on Proposals', href: '/vote' },
              { name: 'View Results', href: '/vote?tab=results' }
            ]
          },
          { name: 'Dashboard', href: '/dashboard', icon: BarChart3 }
        ];

      case 'requester':
        return [
          ...baseNavigation.slice(0, 1),
          { 
            name: 'My Requests', 
            href: '/dashboard?tab=requests', 
            icon: FileText,
            dropdown: [
              { name: 'Create Request', href: '/create' },
              { name: 'Active Requests', href: '/dashboard?tab=requests' },
              { name: 'Request History', href: '/dashboard?tab=history' }
            ]
          },
          { name: 'Browse Community', href: '/requests', icon: Users },
          { 
            name: 'Governance', 
            href: '/vote', 
            icon: Vote,
            dropdown: [
              { name: 'Vote on Proposals', href: '/vote' },
              { name: 'View Results', href: '/vote?tab=results' }
            ]
          },
          { name: 'Dashboard', href: '/dashboard', icon: BarChart3 }
        ];

      case 'verifier':
        return [
          ...baseNavigation.slice(0, 1),
          { name: 'Browse Requests', href: '/requests', icon: FileText },
          { 
            name: 'Verification', 
            href: '/admin?tab=verifications', 
            icon: Shield,
            dropdown: [
              { name: 'Pending Reviews', href: '/admin?tab=verifications' },
              { name: 'Verification History', href: '/admin?tab=history' }
            ]
          },
          { 
            name: 'Governance', 
            href: '/vote', 
            icon: Vote,
            dropdown: [
              { name: 'Vote on Proposals', href: '/vote' },
              { name: 'Create Proposal', href: '/propose' }
            ]
          },
          { name: 'Dashboard', href: '/dashboard', icon: BarChart3 }
        ];

      case 'admin':
        return [
          ...baseNavigation.slice(0, 1),
          { 
            name: 'Administration', 
            href: '/admin', 
            icon: Settings,
            dropdown: [
              { name: 'User Management', href: '/admin?tab=users' },
              { name: 'Platform Settings', href: '/admin?tab=settings' },
              { name: 'Analytics', href: '/admin?tab=analytics' }
            ]
          },
          { 
            name: 'Governance', 
            href: '/vote', 
            icon: Vote,
            dropdown: [
              { name: 'Vote on Proposals', href: '/vote' },
              { name: 'Create Proposal', href: '/propose' },
              { name: 'Manage Proposals', href: '/admin?tab=proposals' }
            ]
          },
          { name: 'All Requests', href: '/requests', icon: FileText },
          { name: 'Transactions', href: '/transactions', icon: BarChart3 }
        ];

      default:
        return baseNavigation;
    }
  };

  const navigation = getNavigationForRole();

  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = () => {
    logout();
    disconnectWallet();
    setShowUserMenu(false);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="p-2 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DeCRiCo
                </span>
                {user && (
                  <div className="text-xs text-slate-400 capitalize">
                    {user.userType} Portal
                  </div>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActiveLink(item.href)
                            ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/10'
                            : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
                          >
                            <div className="py-2">
                              {item.dropdown.map((dropdownItem, index) => (
                                <motion.div
                                  key={dropdownItem.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <Link
                                    to={dropdownItem.href}
                                    className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {dropdownItem.name}
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActiveLink(item.href)
                          ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/10'
                          : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Network Switcher - Only show for non-admin users */}
              {isConnected && user?.userType !== 'admin' && <NetworkSwitcher />}

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-700"
                    >
                      <div className="relative">
                        <img
                          src={user!.avatar}
                          alt={user!.name}
                          className="w-10 h-10 rounded-xl border-2 border-cyan-500/30 object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium text-white">{user!.name}</div>
                        <div className="text-xs text-slate-400 capitalize flex items-center">
                          {user!.userType}
                          {user!.verified && <Shield className="h-3 w-3 ml-1 text-green-400" />}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
                        >
                          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
                            <div className="flex items-center space-x-3">
                              <img
                                src={user!.avatar}
                                alt={user!.name}
                                className="w-12 h-12 rounded-xl border-2 border-cyan-500/30"
                              />
                              <div>
                                <div className="text-sm font-medium text-white">{user!.name}</div>
                                <div className="text-xs text-slate-400">{user!.email}</div>
                                {user!.walletAddress && user.userType !== 'admin' && (
                                  <div className="text-xs text-slate-400 font-mono">
                                    {formatAddress(user!.walletAddress)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="py-2">
                            <Link
                              to="/dashboard"
                              className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <BarChart3 className="h-4 w-4 mr-3" />
                              Dashboard
                            </Link>
                            <Link
                              to="/dashboard?tab=settings"
                              className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="h-4 w-4 mr-3" />
                              Profile Settings
                            </Link>
                            <div className="border-t border-slate-700/50 my-2"></div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Wallet Connection - Only show for non-admin users */}
                  {user?.userType !== 'admin' && (
                    <>
                      {isConnected ? (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm"
                        >
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {formatAddress(address!)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {balance} {network?.nativeCurrency.symbol || 'SEP'}
                            </div>
                          </div>
                          <button
                            onClick={disconnectWallet}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded"
                            title="Disconnect Wallet"
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={connectWallet}
                          disabled={isLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25"
                        >
                          <Wallet className="h-4 w-4" />
                          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    Sign In
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSignupModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden py-4 border-t border-slate-700/50 overflow-hidden"
              >
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.dropdown ? (
                        <div>
                          <button
                            onClick={() => handleDropdownToggle(`mobile-${item.name}`)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isActiveLink(item.href)
                                ? 'text-cyan-400 bg-cyan-500/10'
                                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              activeDropdown === `mobile-${item.name}` ? 'rotate-180' : ''
                            }`} />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === `mobile-${item.name}` && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="ml-6 mt-2 space-y-1 overflow-hidden"
                              >
                                {item.dropdown.map((dropdownItem) => (
                                  <Link
                                    key={dropdownItem.name}
                                    to={dropdownItem.href}
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setActiveDropdown(null);
                                    }}
                                    className="block px-3 py-2 text-sm text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30 rounded-lg transition-colors"
                                  >
                                    {dropdownItem.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActiveLink(item.href)
                              ? 'text-cyan-400 bg-cyan-500/10'
                              : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.name}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Wallet Info - Only show for non-admin users */}
                {isConnected && user?.userType !== 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 pt-4 border-t border-slate-700/50"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-white">{formatAddress(address!)}</div>
                        <div className="text-xs text-slate-400">{balance} {network?.nativeCurrency.symbol || 'SEP'}</div>
                        <div className="text-xs text-slate-500">{network?.name}</div>
                      </div>
                      <button
                        onClick={disconnectWallet}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Header;