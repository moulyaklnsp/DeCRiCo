export interface User {
  id: string;
  username: string;
  email: string;
  role: 'donor' | 'verifier' | 'requester' | 'admin';
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  amount_needed: number;
  amount_raised: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requester_id: string;
  created_at: string;
  updated_at: string;
  requester?: User;
  votes?: Vote[];
}

export interface Vote {
  id: string;
  request_id: string;
  voter_id: string;
  vote_type: 'approve' | 'reject';
  created_at: string;
  voter?: User;
  request?: Request;
}

export interface Donation {
  id: string;
  request_id: string;
  donor_id: string;
  amount: number;
  transaction_hash: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  donor?: User;
  request?: Request;
}

export interface WalletState {
  address: string | null;
  network: 'mainnet' | 'sepolia';
  balance: string;
  connected: boolean;
}