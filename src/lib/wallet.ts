import { ethers } from 'ethers';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to connect your wallet');
      return null;
    }

    try {
      // Request account access with better error handling
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found. Please make sure MetaMask is unlocked.');
        return null;
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      return accounts[0];
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        toast.error('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (error.code === -32002) {
        toast.error('Connection request already pending. Please check MetaMask.');
      } else if (error.message?.includes('User rejected')) {
        toast.error('Connection rejected by user.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      
      return null;
    }
  }

  async switchNetwork(networkType: 'mainnet' | 'sepolia'): Promise<boolean> {
    if (!window.ethereum) return false;

    const networks = {
      mainnet: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/your-infura-key'],
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      },
      sepolia: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Test Network',
        rpcUrls: ['https://sepolia.infura.io/v3/your-infura-key'],
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      },
    };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networks[networkType].chainId }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networks[networkType]],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', error);
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } catch (error) {
        return '0';
      }
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string | null> {
    if (!window.ethereum) {
      toast.error('MetaMask not found');
      return null;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Validate inputs
      if (!ethers.isAddress(to)) {
        toast.error('Invalid recipient address');
        return null;
      }

      const amountWei = ethers.parseEther(amount);
      if (amountWei <= 0) {
        toast.error('Invalid amount');
        return null;
      }

      // Check balance
      const senderAddress = await this.signer.getAddress();
      const balance = await this.provider.getBalance(senderAddress);
      
      if (balance < amountWei) {
        toast.error('Insufficient balance for this transaction');
        return null;
      }

      // Estimate gas
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: amountWei,
      });

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100);

      // Prepare transaction
      const tx = {
        to,
        value: amountWei,
        gasLimit,
      };

      console.log('Sending transaction:', {
        to,
        amount: amount + ' ETH',
        gasLimit: gasLimit.toString()
      });

      // Send transaction
      const transaction = await this.signer.sendTransaction(tx);
      
      // Show transaction hash immediately
      toast.success(`Transaction sent! Hash: ${transaction.hash.slice(0, 10)}...`);
      
      // Wait for confirmation
      const receipt = await transaction.wait();
      
      if (receipt?.status === 1) {
        toast.success('Transaction confirmed!');
        return transaction.hash;
      } else {
        toast.error('Transaction failed');
        return null;
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.code === -32603) {
        toast.error('Insufficient funds for transaction');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees');
      } else if (error.message?.includes('user rejected')) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Transaction failed: ' + (error.reason || error.message || 'Unknown error'));
      }
      
      return null;
    }
  }

  async getCurrentNetwork(): Promise<string> {
    if (!this.provider) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } catch (error) {
        return 'unknown';
      }
    }

    try {
      const network = await this.provider.getNetwork();
      return network.name;
    } catch (error) {
      console.error('Error getting network:', error);
      return 'unknown';
    }
  }

  async estimateGas(to: string, amount: string): Promise<string> {
    if (!this.provider) return '0';

    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(amount),
      });
      return ethers.formatUnits(gasEstimate, 'gwei');
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '0';
    }
  }

  // Helper method to check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  // Helper method to check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    if (!window.ethereum) return false;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts && accounts.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export const walletService = new WalletService();