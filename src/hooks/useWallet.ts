import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { abi } from '../types/abi';
import { parseError } from '../utils/helpers';

interface WalletContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  userAddress: string | null;
  connectWallet: (manual?: boolean) => Promise<void>;
  disconnectWallet: () => void;
  status: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const contractAddress = '0x0fd5991e652277F0C906aEF17aBD37A4c2c484d1';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const connectWallet = async (manual = false) => {
    setStatus(manual ? 'Connecting wallet...' : 'Checking wallet connection...');
    try {
      if (!window.ethereum) throw new Error('No wallet detected. Please install MetaMask.');
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 207) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xcf' }],
        });
      }
      const accounts = manual
        ? await window.ethereum.request({ method: 'eth_requestAccounts' })
        : await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        setStatus('Please connect your wallet.');
        return;
      }
      const web3Signer = web3Provider.getSigner();
      const web3Contract = new ethers.Contract(contractAddress, abi, web3Signer);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(web3Contract);
      setUserAddress(accounts[0]);
      setStatus('Wallet connected successfully!');
    } catch (error) {
      setStatus(`Connection failed: ${parseError(error)}`);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserAddress(null);
    setStatus('Wallet disconnected');
  };

  useEffect(() => {
    connectWallet(false);
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  return (
    <WalletContext.Provider value={{ provider, signer, contract, userAddress, connectWallet, disconnectWallet, status }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
