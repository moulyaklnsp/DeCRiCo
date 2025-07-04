import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const NetworkSwitcher: React.FC = () => {
  const { network, switchNetwork, addNetwork, getSupportedNetworks, isConnected, isLoading } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const supportedNetworks = getSupportedNetworks();

  const handleNetworkSwitch = async (targetNetwork: any) => {
    if (!isConnected) return;
    
    setSwitchingTo(targetNetwork.chainId);
    try {
      await switchNetwork(targetNetwork);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setSwitchingTo(null);
    }
  };

  const getNetworkIcon = (networkName: string) => {
    if (networkName.toLowerCase().includes('mainnet')) {
      return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    } else if (networkName.toLowerCase().includes('testnet') || networkName.toLowerCase().includes('localhost')) {
      return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
    }
    return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
  };

  const getNetworkStatus = () => {
    if (!isConnected) return { icon: WifiOff, color: 'text-red-400', text: 'Disconnected' };
    if (!network) return { icon: AlertTriangle, color: 'text-yellow-400', text: 'Unknown Network' };
    return { icon: Wifi, color: 'text-green-400', text: 'Connected' };
  };

  const status = getNetworkStatus();

  if (!isConnected) {
    return (
      <div className="flex items-center px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
        <WifiOff className="h-4 w-4 text-red-400 mr-2" />
        <span className="text-red-400 text-sm">Not Connected</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
      >
        <status.icon className={`h-4 w-4 ${status.color}`} />
        <div className="flex items-center space-x-2">
          {network && getNetworkIcon(network.name)}
          <span className="text-white text-sm font-medium">
            {network ? network.name : 'Unknown'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-white font-medium mb-1">Select Network</h3>
              <p className="text-slate-400 text-sm">Choose a blockchain network to connect to</p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {/* Mainnet Networks */}
              <div className="p-2">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2">
                  Mainnet
                </div>
                {supportedNetworks
                  .filter(net => !net.testnet)
                  .map((net) => (
                    <motion.button
                      key={net.chainId}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNetworkSwitch(net)}
                      disabled={switchingTo === net.chainId || isLoading}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        network?.chainId === net.chainId
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'hover:bg-slate-700/50'
                      } ${switchingTo === net.chainId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getNetworkIcon(net.name)}
                        <div className="text-left">
                          <div className="text-white font-medium text-sm">{net.name}</div>
                          <div className="text-slate-400 text-xs">{net.nativeCurrency.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {switchingTo === net.chainId && (
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {network?.chainId === net.chainId && (
                          <CheckCircle className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
              </div>

              {/* Testnet Networks */}
              <div className="p-2 border-t border-slate-700/50">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2">
                  Testnet
                </div>
                {supportedNetworks
                  .filter(net => net.testnet)
                  .map((net) => (
                    <motion.button
                      key={net.chainId}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNetworkSwitch(net)}
                      disabled={switchingTo === net.chainId || isLoading}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        network?.chainId === net.chainId
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : 'hover:bg-slate-700/50'
                      } ${switchingTo === net.chainId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getNetworkIcon(net.name)}
                        <div className="text-left">
                          <div className="text-white font-medium text-sm">{net.name}</div>
                          <div className="text-slate-400 text-xs">{net.nativeCurrency.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {switchingTo === net.chainId && (
                          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {network?.chainId === net.chainId && (
                          <CheckCircle className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center text-slate-400 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Switching networks may require MetaMask approval</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkSwitcher;