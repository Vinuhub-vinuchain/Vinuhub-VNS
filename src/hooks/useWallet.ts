// src/hooks/useWallet.ts
'use client';

import { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import VinuDomainABI from '../types/abi';

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

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setStatus('MetaMask not detected');
      return;
    }

    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send('eth_requestAccounts', []);

      const network = await prov.getNetwork();
      if (network.chainId !== CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xcf' }],
        });
      }

      const sig = prov.getSigner();
      const addr = await sig.getAddress();
      const cont = new ethers.Contract(CONTRACT_ADDRESS, VinuDomainABI, sig);

      setProvider(prov);
      setSigner(sig);
      setContract(cont);
      setUserAddress(addr);
      setStatus(`Connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
    } catch (err: any) {
      setStatus(err?.message || 'Connection failed');
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
    <WalletContext.Provider value={{
      provider, signer, contract, userAddress,
      connectWallet, disconnectWallet, status
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
