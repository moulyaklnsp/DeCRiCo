import { ethers } from 'ethers';

export const formatEther = (value: string | number) => {
  return ethers.formatEther(value.toString());
};

export const parseEther = (value: string) => {
  return ethers.parseEther(value);
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getCategoryName = (categoryId: number) => {
  const categories = ['Emergency', 'Medical', 'Housing', 'Food', 'Education', 'Infrastructure'];
  return categories[categoryId] || 'Unknown';
};

export const getStatusName = (statusId: number) => {
  const statuses = ['Active', 'Completed', 'Cancelled'];
  return statuses[statusId] || 'Unknown';
};

export const getProposalStatusName = (statusId: number) => {
  const statuses = ['Active', 'Passed', 'Rejected', 'Executed'];
  return statuses[statusId] || 'Unknown';
};

export const getProposalCategoryName = (categoryId: number) => {
  const categories = ['Governance', 'Funding', 'Economics', 'Technical', 'Community'];
  return categories[categoryId] || 'Unknown';
};

export const calculateTimeLeft = (deadline: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = deadline - now;
  
  if (timeLeft <= 0) return 'Ended';
  
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return 'Less than 1 hour';
};

export const validateEthereumAddress = (address: string) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const handleContractError = (error: any) => {
  console.error('Contract error:', error);
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction';
  }
  
  if (error.code === 'USER_REJECTED') {
    return 'Transaction rejected by user';
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

export const estimateGas = async (contract: ethers.Contract, method: string, params: any[]) => {
  try {
    const gasEstimate = await contract[method].estimateGas(...params);
    return gasEstimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return null;
  }
};

export const waitForTransaction = async (tx: ethers.TransactionResponse) => {
  try {
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};