import { ethers } from 'ethers';

export function parseError(error: any): string {
  if (error.code === -32603 && error.data && error.data.message) return error.data.message;
  if (error.reason) return error.reason;
  if (error.message.includes('insufficient funds')) return 'Insufficient funds for gas or transaction value. Please add more VC to your wallet.';
  if (error.message.includes('network')) return 'Network error. Please ensure you are connected to VinuChain (Chain ID: 207).';
  if (error.message.includes('revert')) return 'Transaction reverted. Please check domain availability or contract state.';
  return error.message || 'An unexpected error occurred. Please try again.';
}

export function getRegistrationFee(name: string): ethers.BigNumber {
  const length = name.replace('.vc', '').length;
  return length <= 5 ? ethers.utils.parseEther('20000') : ethers.utils.parseEther('10000');
}
