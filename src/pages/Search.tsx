'use client';

import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import styles from '../styles/Search.module.css';

const Search: React.FC = () => {
  const { contract } = useWallet();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');

  const check = async () => {
    if (!contract) return setStatus('Connect wallet');
    const name = domain.trim().replace('.vc', '');
    if (!name) return setStatus('Enter name');
    try {
      const expiry = await contract.nameToExpiry(name);
      setStatus(`${name}.vc is ${expiry.toNumber() < Date.now() / 1000 ? 'Available' : 'Taken'}`);
    } catch (e) {
      setStatus(`Error: ${parseError(e)}`);
    }
  };

  return (
    <section id="search" className={styles.card}>
      <h2>Search .vc Domains</h2>
      <div className={styles.inputGroup}>
        <label>Domain Name</label>
        <input
          type="text"
          placeholder="Enter name (e.g., example)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button onClick={check}>
          <i className="fas fa-search"></i> Check
        </button>
      </div>
      <p>{status}</p>
    </section>
  );
};

export default Search;
