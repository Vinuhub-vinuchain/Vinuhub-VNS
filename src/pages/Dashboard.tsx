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
      if (!contract || !userAddress) return;
      setLoading(true);
      try {
        // Safe: only use indexed params
        const transfersTo = await contract.queryFilter(contract.filters.Transfer(null, userAddress));
        const tokenIds = new Set(transfersTo.map((t: any) => t.args.tokenId.toString()));

        const owned = [];
        for (const id of tokenIds) {
          const owner = await contract.ownerOf(id);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            owned.push({ tokenId: id });
          }
        }

        const domainData = await Promise.all(
          owned.map(async ({ tokenId }: any) => {
            // Get name from events (safe)
            const registered = await contract.queryFilter(contract.filters.DomainRegistered(tokenId));
            const nameEvent = registered[0];
            const name = nameEvent ? nameEvent.args.name + '.vc' : `Domain #${tokenId}`;
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

  if (loading) return <p>Loading domains...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className={styles.card}>
      <h2>Your Dashboard</h2>
      <div className={styles.cardGrid}>
        {domains.length ? (
          domains.map((dom) => (
            <div key={dom.tokenId} className={styles.domainCard}>
              <h3>{dom.name}</h3>
              <p>Expiry: {new Date(dom.expiry * 1000).toLocaleDateString()}</p>
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
