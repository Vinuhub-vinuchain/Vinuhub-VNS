// src/hooks/useWallet.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import VinuDomainABI from '../types/abi';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = '0x0fd5991e652277F0C906aEF17aBD37A4c2c484d1';
const CHAIN_ID = 207;

interface WalletContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  userAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  status: string;
}

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  contract: null,
  userAddress: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  status: '',
});

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('MetaMask not detected');
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const network = await web3Provider.getNetwork();

      if (network.chainId !== CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xcf' }],
        });
      }

      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VinuDomainABI, signer);

      setProvider(web3Provider);
      setSigner(signer);
      setContract(contract);
      setUserAddress(address);
      setStatus(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error: any) {
      setStatus(error?.message || 'Wallet connection failed');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserAddress(null);
    setStatus('');
  };

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        contract,
        userAddress,
        connectWallet,
        disconnectWallet,
        status,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
