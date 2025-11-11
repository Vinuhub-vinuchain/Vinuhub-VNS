import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import styles from '../styles/Transfer.module.css';
import { ethers } from 'ethers';

const Transfer: React.FC = () => {
  const { contract, userAddress, status } = useWallet();
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [transferStatus, setTransferStatus] = useState('');

  const handleTokenTransfer = async () => {
    if (!contract || !userAddress) {
      setTransferStatus('Wallet not connected');
      return;
    }
    const name = domain.replace('.vc', '');
    if (!name || !amount) {
      setTransferStatus('Please enter domain and amount');
      return;
    }
    try {
      const weiAmount = ethers.utils.parseEther(amount);
      const tx = await contract.transferWithDomain(name, weiAmount, { value: weiAmount });
      await tx.wait();
      setTransferStatus(`Transferred ${amount} VC to ${name}.vc successfully! Tx: ${tx.hash}`);
    } catch (error) {
      setTransferStatus(`Transfer failed: ${parseError(error)}`);
    }
  };

  const handleDomainTransfer = async () => {
    if (!contract || !userAddress) {
      setTransferStatus('Wallet not connected');
      return;
    }
    const name = domain.replace('.vc', '');
    if (!name || !newAddress) {
      setTransferStatus('Please enter domain and new address');
      return;
    }
    try {
      const tx = await contract.setAddress(name, newAddress);
      await tx.wait();
      setTransferStatus(`Transferred ${name}.vc to ${newAddress} successfully! Tx: ${tx.hash}`);
    } catch (error) {
      setTransferStatus(`Transfer failed: ${parseError(error)}`);
    }
  };

  return (
    <section className={styles.card}>
      <h2>Transfer</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="domainInput">Domain Name</label>
        <input
          id="domainInput"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter name (e.g., example)"
        />
      </div>
      <div className={styles.inputGroup}>
        <h3>Transfer Tokens</h3>
        <label htmlFor="amountInput">Amount (VC)</label>
        <input
          id="amountInput"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (e.g., 1.5)"
        />
        <button onClick={handleTokenTransfer} disabled={!domain || !amount || !contract}>
          Transfer Tokens
        </button>
      </div>
      <div className={styles.inputGroup}>
        <h3>Transfer Domain Ownership</h3>
        <label htmlFor="addressInput">New Address</label>
        <input
          id="addressInput"
          type="text"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Enter new address (e.g., 0x...)"
        />
        <button onClick={handleDomainTransfer} disabled={!domain || !newAddress || !contract}>
          Transfer Domain
        </button>
      </div>
      <p>{transferStatus || status}</p>
    </section>
  );
};

export default Transfer;
