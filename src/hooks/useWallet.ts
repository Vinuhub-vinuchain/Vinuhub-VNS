'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import VinuDomainABI from '@/types/abi/VinuDomain.json'; // ← Proper ABI import

const CONTRACT_ADDRESS = '0x0fd5991e652277F0C906aEF17aBD37A4c2c484d1';
const CHAIN_ID = 207; // ← Correct VinuChain Mainnet ID

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

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setStatus('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const network = await provider.getNetwork();
      if (network.chainId !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: 'VinuChain Mainnet',
                rpcUrls: ['https://rpc.vinuchain.org'],
                nativeCurrency: { name: 'VinuChain', symbol: 'VC', decimals: 18 },
                blockExplorerUrls: ['https://explorer.vinuchain.org'],
              }],
            });
          }
        }
      }

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VinuDomainABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setUserAddress(address);
      setStatus(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (err: any) {
      setStatus(err.message || 'Connection failed');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserAddress(null);
    setStatus('Disconnected');
  };

  return (
    <WalletContext.Provider value={{
      provider,
      signer,
      contract,
      userAddress,
      connectWallet,
      disconnectWallet,
      status,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
