import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Search, 
  Calendar, 
  ExternalLink, 
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { useTransactions, Transaction } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';

const TransactionHistoryPage: React.FC = () => {
  const { transactions, getAllTransactions, getTotalVolume } = useTransactions();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'donation', label: 'Donations' },
    { value: 'request_creation', label: 'Request Creation' },
    { value: 'vote', label: 'Votes' },
    { value: 'proposal_creation', label: 'Proposal Creation' },
    { value: 'verification', label: 'Verifications' },
    { value: 'withdrawal', label: 'Withdrawals' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  // Get all transactions for admin, otherwise empty array since we're showing platform-wide data
  const relevantTransactions = useMemo(() => {
    if (user?.userType === 'admin') {
      return getAllTransactions();
    }
    return [];
  }, [user, transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return relevantTransactions.filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const txDate = new Date(tx.timestamp);
        const now = new Date();
        
        switch (dateRange) {
          case 'today':
            matchesDate = txDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = txDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = txDate >= monthAgo;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            matchesDate = txDate >= yearAgo;
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [relevantTransactions, searchTerm, selectedType, selectedStatus, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const totalVolume = filteredTransactions
      .filter(tx => tx.amount)
      .reduce((sum, tx) => sum + parseFloat(tx.amount!), 0);
    
    const donationCount = filteredTransactions.filter(tx => tx.type === 'donation').length;
    const avgTransactionValue = donationCount > 0 ? totalVolume / donationCount : 0;

    return {
      totalTransactions,
      totalVolume,
      donationCount,
      avgTransactionValue
    };
  }, [filteredTransactions]);

  const getTransactionIcon = (type: Transaction['type']) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'donation':
        return <ArrowUpRight className={`${iconClass} text-red-400`} />;
      case 'request_creation':
        return <Users className={`${iconClass} text-blue-400`} />;
      case 'vote':
        return <Activity className={`${iconClass} text-purple-400`} />;
      case 'proposal_creation':
        return <TrendingUp className={`${iconClass} text-orange-400`} />;
      default:
        return <Activity className={`${iconClass} text-slate-400`} />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'From', 'To', 'Amount (SEP)', 'Status', 'Transaction Hash', 'Description'].join(','),
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleString(),
        tx.type,
        tx.from,
        tx.to || '',
        tx.amount || '',
        tx.status,
        tx.transactionHash,
        `"${tx.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show access denied for non-admin users
  if (user?.userType !== 'admin') {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center"
          >
            <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-300 mb-6">
              Transaction history is only available to administrators for platform monitoring purposes.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Transaction History</h1>
            <p className="text-slate-300">
              Complete transaction history across the DeCRiCo platform
            </p>
          </div>
          <button
            onClick={exportTransactions}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-blue-400" />
              <span className="text-xs text-slate-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalTransactions}</div>
            <div className="text-sm text-slate-300">Transactions</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-400" />
              <span className="text-xs text-slate-400">Volume</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalVolume.toFixed(2)} SEP</div>
            <div className="text-sm text-slate-300">Total Volume</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpRight className="h-8 w-8 text-purple-400" />
              <span className="text-xs text-slate-400">Donations</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.donationCount}</div>
            <div className="text-sm text-slate-300">Total Donations</div>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <span className="text-xs text-slate-400">Average</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.avgTransactionValue.toFixed(3)} SEP</div>
            <div className="text-sm text-slate-300">Avg Donation</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {dateRangeOptions.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600">
              <span className="text-slate-300 text-sm">
                {filteredTransactions.length} results
              </span>
            </div>
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-700/50 rounded-xl">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">
                        {transaction.description}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-slate-400">From</label>
                        <p className="text-white font-mono">{formatAddress(transaction.from)}</p>
                      </div>
                      
                      {transaction.to && (
                        <div>
                          <label className="text-slate-400">To</label>
                          <p className="text-white font-mono">{formatAddress(transaction.to)}</p>
                        </div>
                      )}
                      
                      {transaction.amount && (
                        <div>
                          <label className="text-slate-400">Amount</label>
                          <p className="text-white font-medium">{transaction.amount} SEP</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-slate-400">Date</label>
                        <p className="text-white">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {transaction.gasFee && (
                      <div className="mt-3 text-xs text-slate-400">
                        Gas Fee: {transaction.gasFee} SEP • Block: {transaction.blockNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {transaction.amount && (
                    <div className="text-right text-green-400">
                      <div className="text-lg font-medium">
                        {transaction.amount} SEP
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`, '_blank')}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50"
          >
            <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
            <p className="text-slate-400">
              Try adjusting your filters or check back later for new transactions.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;