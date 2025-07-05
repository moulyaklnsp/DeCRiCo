import { create } from 'zustand';
import { WalletState } from '../types';
import { walletService } from '../lib/wallet';

interface WalletStore extends WalletState {
  connectWallet: () => Promise<void>;
  switchNetwork: (network: 'mainnet' | 'sepolia') => Promise<void>;
  updateBalance: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: null,
  network: 'mainnet',
  balance: '0',
  connected: false,

  connectWallet: async () => {
    try {
      const address = await walletService.connectWallet();
      if (address) {
        const balance = await walletService.getBalance(address);
        const network = await walletService.getCurrentNetwork();
        
        set({
          address,
          balance,
          network: network === 'sepolia' ? 'sepolia' : 'mainnet',
          connected: true,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  },

  switchNetwork: async (network: 'mainnet' | 'sepolia') => {
    try {
      const success = await walletService.switchNetwork(network);
      if (success) {
        set({ network });
        get().updateBalance();
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  },

  updateBalance: async () => {
    const { address } = get();
    if (address) {
      try {
        const balance = await walletService.getBalance(address);
        set({ balance });
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  },

  disconnect: () => {
    set({
      address: null,
      network: 'mainnet',
      balance: '0',
      connected: false,
    });
  },
}));