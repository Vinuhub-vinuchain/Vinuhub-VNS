import { ethers } from 'ethers';

export function parseError(error: any): string {
  if (error.reason) return error.reason;
  if (error.data?.message) return error.data.message;
  return error.message || 'Unknown error';
}

export function getRegistrationFee(name: string): ethers.BigNumber {
  const len = name.replace('.vc', '').length;
  return len <= 5 ? ethers.utils.parseEther('20000') : ethers.utils.parseEther('10000');
}
