import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Network {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet?: boolean;
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: Network | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: Network) => Promise<void>;
  addNetwork: (network: Network) => Promise<void>;
  getSupportedNetworks: () => Network[];
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Supported Networks - Sepolia as default
const SUPPORTED_NETWORKS: Network[] = [
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    testnet: true
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'GOR', decimals: 18 },
    testnet: true
  },
  {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    testnet: true
  },
  {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545/',
    blockExplorer: '',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true
  }
];

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.0');
  const [network, setNetwork] = useState<Network | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSupportedNetworks = () => SUPPORTED_NETWORKS;

  const getNetworkByChainId = (chainId: number): Network | null => {
    return SUPPORTED_NETWORKS.find(network => network.chainId === chainId) || null;
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();
      
      // Get network info
      const networkInfo = await web3Provider.getNetwork();
      const currentNetwork = getNetworkByChainId(Number(networkInfo.chainId));
      
      // If not on Sepolia, switch to Sepolia
      if (Number(networkInfo.chainId) !== 11155111) {
        const sepoliaNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === 11155111);
        if (sepoliaNetwork) {
          await switchNetwork(sepoliaNetwork);
          return; // Exit here as switchNetwork will call connectWallet again
        }
      }
      
      // Get balance
      const userBalance = await web3Provider.getBalance(userAddress);
      const formattedBalance = ethers.formatEther(userBalance);
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(userAddress);
      setBalance(parseFloat(formattedBalance).toFixed(4));
      setNetwork(currentNetwork);
      setChainId(Number(networkInfo.chainId));
      setIsConnected(true);
      
      // Store connection state
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', userAddress);
      localStorage.setItem('selectedNetwork', JSON.stringify(currentNetwork));
      
      console.log('Wallet connected:', {
        address: userAddress,
        balance: formattedBalance,
        network: currentNetwork?.name,
        chainId: Number(networkInfo.chainId)
      });
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      disconnectWallet();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0.0');
    setNetwork(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('selectedNetwork');
    console.log('Wallet disconnected');
  };

  const switchNetwork = async (targetNetwork: Network) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const chainIdHex = `0x${targetNetwork.chainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      // Update local state
      setNetwork(targetNetwork);
      setChainId(targetNetwork.chainId);
      localStorage.setItem('selectedNetwork', JSON.stringify(targetNetwork));
      
      // Reconnect to update balance and other details
      if (isConnected) {
        await connectWallet();
      }
      
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await addNetwork(targetNetwork);
      } else {
        throw switchError;
      }
    }
  };

  const addNetwork = async (networkToAdd: Network) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const chainIdHex = `0x${networkToAdd.chainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: networkToAdd.name,
          nativeCurrency: networkToAdd.nativeCurrency,
          rpcUrls: [networkToAdd.rpcUrl],
          blockExplorerUrls: networkToAdd.blockExplorer ? [networkToAdd.blockExplorer] : []
        }],
      });
      
      // After adding, switch to the network
      await switchNetwork(networkToAdd);
      
    } catch (addError) {
      throw new Error('Failed to add network to MetaMask');
    }
  };

  const updateBalance = async () => {
    if (provider && address) {
      try {
        const userBalance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(userBalance);
        setBalance(parseFloat(formattedBalance).toFixed(4));
      } catch (err) {
        console.error('Failed to update balance:', err);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== address) {
      // Account changed, reconnect
      connectWallet();
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    const newNetwork = getNetworkByChainId(newChainId);
    
    setChainId(newChainId);
    setNetwork(newNetwork);
    
    if (newNetwork) {
      localStorage.setItem('selectedNetwork', JSON.stringify(newNetwork));
    }
    
    // Update balance for new network
    updateBalance();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  useEffect(() => {
    // Check if wallet was previously connected
    const wasConnected = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected === 'true' && savedAddress && typeof window.ethereum !== 'undefined') {
      connectWallet();
    }

    // Set up event listeners
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (isConnected && provider && address) {
      updateBalance();
      const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, provider, address, chainId]);

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      balance,
      network,
      chainId,
      provider,
      signer,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      addNetwork,
      getSupportedNetworks,
      isLoading,
      error
    }}>
      {children}
    </WalletContext.Provider>
  );
};