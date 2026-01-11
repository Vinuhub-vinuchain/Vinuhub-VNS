'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import { ethers } from 'ethers';
import styles from '../styles/Marketplace.module.css';

const Marketplace: React.FC = () => {
  const { contract } = useWallet();
  const [listed, setListed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      setLoading(true);
      try {
        const listedEvents = await contract.queryFilter(contract.filters.DomainListed());
        const soldEvents = await contract.queryFilter(contract.filters.DomainSold());
        const soldIds = new Set(soldEvents.map((e: any) => e.args.tokenId.toString()));

        const items = [];
        for (const e of listedEvents) {
          const tokenId = e.args.tokenId.toString();
          if (soldIds.has(tokenId)) continue;
          const price = await contract.tokenIdToPrice(tokenId);
          if (price.eq(0)) continue;
          items.push({ tokenId, price: price.toString() });
        }

        setListed(items);
      } catch (e) {
        setStatus(`Failed: ${parseError(e)}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contract]);

  const handleBuy = async (tokenId: string) => {
    if (!contract) return;
    try {
      const price = await contract.tokenIdToPrice(tokenId);
      const tx = await contract.buyDomain(tokenId, { value: price });
      await tx.wait();
      setStatus('Bought successfully!');
      setListed((prev) => prev.filter((item) => item.tokenId !== tokenId));
    } catch (e) {
      setStatus(`Buy failed: ${parseError(e)}`);
    }
  };

  if (loading) return <p>Loading marketplace...</p>;

  return (
    <section className={styles.card}>
      <h2>Marketplace</h2>
      <div className={styles.cardGrid}>
        {listed.length ? (
          listed.map((item) => (
            <div key={item.tokenId} className={styles.item}>
              <p>Domain #{item.tokenId.slice(0, 6)}...</p>
              <p>Price: {ethers.utils.formatEther(item.price)} VC</p>
              <button onClick={() => handleBuy(item.tokenId)}>Buy</button>
            </div>
          ))
        ) : (
          <p>No domains listed</p>
        )}
      </div>
      <p>{status}</p>
    </section>
  );
};

export default Marketplace;
