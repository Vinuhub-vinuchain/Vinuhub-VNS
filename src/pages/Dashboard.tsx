'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import styles from '../styles/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { contract, userAddress } = useWallet();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!contract || !userAddress) {
        setError('Connect wallet to view domains');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Safe: only use indexed Transfer events (no non-indexed parameters)
        const transfersTo = await contract.queryFilter(contract.filters.Transfer(null, userAddress));

        // Convert to array to avoid TS2802 Set iteration error
        const tokenIdsArray = Array.from(
          new Set(transfersTo.map((t: any) => t.args.tokenId.toString()))
        );

        const owned = [];
        for (const id of tokenIdsArray) {
          const owner = await contract.ownerOf(id);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            owned.push(id);
          }
        }

        const domainData = await Promise.all(
          owned.map(async (tokenId: string) => {
            // Get registration event for this tokenId (safe indexed filter)
            const registeredEvents = await contract.queryFilter(
              contract.filters.DomainRegistered(tokenId)
            );
            const regEvent = registeredEvents[0];
            const name = regEvent ? regEvent.args.name + '.vc' : `Domain #${tokenId.slice(0, 8)}`;
            const expiry = await contract.nameToExpiry(name.replace('.vc', ''));
            return { name, expiry: expiry.toNumber(), tokenId };
          })
        );

        setDomains(domainData);
      } catch (e) {
        setError(parseError(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [contract, userAddress]);

  if (loading) return <p className={styles.loading}>Loading domains...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <section id="dashboard" className={styles.card}>
      <h2>Your Dashboard</h2>
      <div className={styles.cardGrid}>
        {domains.length ? (
          domains.map((dom) => (
            <div key={dom.tokenId} className={styles.domainCard}>
              <h3>{dom.name}</h3>
              <p>Expiry: {dom.expiry > 0 ? new Date(dom.expiry * 1000).toLocaleDateString() : 'Expired or invalid'}</p>
            </div>
          ))
        ) : (
          <p>No domains owned</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
