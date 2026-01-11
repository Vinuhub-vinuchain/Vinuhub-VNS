// src/pages/Transfer.tsx
'use client';

import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import { ethers } from 'ethers';
import styles from '../styles/Transfer.module.css';

const Transfer: React.FC = () => {
  const { contract, userAddress } = useWallet();
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    if (!contract || !userAddress) return;
    const name = domain.trim().replace('.vc', '');
    if (!name || !amount) return;

    try {
      const weiAmount = ethers.utils.parseEther(amount);
      const tx = await contract.transferWithDomain(name, weiAmount, { value: weiAmount });
      await tx.wait();
      setStatus(`Transferred ${amount} VC to ${name}.vc!`);
    } catch (error) {
      setStatus(`Failed: ${parseError(error)}`);
    }
  };

  return (
    <section id="transfer" className={styles.card}>
      <h2>Transfer Tokens</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="transferDomain">Recipient Domain</label>
        <input
          id="transferDomain"
          type="text"
          placeholder="e.g., example.vc"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <label htmlFor="transferAmount">Amount (VC)</label>
        <input
          id="transferAmount"
          type="number"
          placeholder="e.g., 10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleTransfer} disabled={!domain || !amount || !contract}>
          <i className="fas fa-paper-plane"></i> Transfer
        </button>
      </div>
      <p>{status}</p>
    </section>
  );
};

export default Transfer;
