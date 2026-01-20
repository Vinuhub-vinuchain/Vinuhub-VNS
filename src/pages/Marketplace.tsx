'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import { ethers } from 'ethers';
import styles from '../styles/Marketplace.module.css';

const Marketplace: React.FC = () => {
  const { contract } = useWallet();
  const [listedDomains, setListedDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!contract) throw new Error('Connect wallet');
        const listedEvents = await contract.queryFilter(contract.filters.DomainListed());
        const soldEvents = await contract.queryFilter(contract.filters.DomainSold());
        const soldIds = new Set(soldEvents.map((e: any) => e?.args?.tokenId?.toString() || ''));

        const items = [];
        for (const e of listedEvents) {
          const tokenId = e?.args?.tokenId?.toString() || '';
          if (!tokenId || soldIds.has(tokenId)) continue;
          const price = await contract.tokenIdToPrice(tokenId);
          if (price.eq(0)) continue;
          const registered = await contract.queryFilter(contract.filters.DomainRegistered(tokenId));
          const name = registered[0]?.args?.name 
            ? registered[0].args.name + '.vc' 
            : `Domain #${tokenId.slice(0, 8)}`;
          items.push({ name, price: price.toString(), tokenId });
        }
        setListedDomains(items);
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
      setListedDomains((prev) => prev.filter((item) => item.tokenId !== tokenId));
    } catch (e) {
      setStatus(`Buy failed: ${parseError(e)}`);
    }
  };

  if (loading) return <p>Loading marketplace...</p>;

  return (
    <section id="marketplace" className={styles.card}>
      <h2>Marketplace - List or Buy Domains</h2>
      <div className={styles.inputGroup}>
        {/* List form - optional, add if needed */}
      </div>
      <div id="marketList" style={{ marginTop: '20px' }}>
        <h3>Available Domains</h3>
        <div id="marketListItems" className={styles.cardGrid}>
          {listedDomains.length ? (
            listedDomains.map((item) => (
              <div key={item.tokenId} className={styles.marketplaceItem}>
                <h3>{item.name}</h3>
                <p>Price: {ethers.utils.formatEther(item.price)} VC</p>
                <button onClick={() => handleBuy(item.tokenId)}>
                  <i className="fas fa-shopping-cart"></i> Buy
                </button>
              </div>
            ))
          ) : (
            <p>No domains listed for sale</p>
          )}
        </div>
      </div>
      <p id="marketStatus">{status}</p>
    </section>
  );
};

export default Marketplace;
