import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import styles from '../styles/Search.module.css';

const Search: React.FC = () => {
  const { contract, userAddress, status } = useWallet();
  const [domain, setDomain] = useState('');
  const [availability, setAvailability] = useState<string | null>(null);

  const checkAvailability = async () => {
    if (!contract) {
      setAvailability('Wallet not connected');
      return;
    }
    const name = domain.replace('.vc', '');
    if (!name || !/^[a-zA-Z0-9]+$/.test(name)) {
      setAvailability('Invalid domain name (alphanumeric only)');
      return;
    }
    try {
      const tokenId = await contract.nameToTokenId(name);
      const expiry = await contract.nameToExpiry(name);
      const isTaken = tokenId.toNumber() !== 0 && expiry.toNumber() > Math.floor(Date.now() / 1000);
      setAvailability(isTaken ? `${name}.vc is taken` : `${name}.vc is available`);
    } catch (error) {
      setAvailability(`Error checking availability: ${parseError(error)}`);
    }
  };

  return (
    <section className={styles.card}>
      <h2>Search Domains</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="searchInput">Domain Name</label>
        <input
          id="searchInput"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter name (e.g., example)"
        />
        <button onClick={checkAvailability} disabled={!domain || !contract}>
          Check Availability
        </button>
      </div>
      <p>{availability || status}</p>
    </section>
  );
};

export default Search;
