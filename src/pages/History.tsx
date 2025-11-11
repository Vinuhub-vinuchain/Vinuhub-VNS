import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { RegisteredDomain } from '../types';
import { parseError } from '../utils/helpers';
import styles from '../styles/History.module.css';
import { ethers } from 'ethers';

const History: React.FC = () => {
  const { contract, userAddress, provider, status } = useWallet();
  const [history, setHistory] = useState<any[]>([]);
  const [registeredDomains, setRegisteredDomains] = useState<RegisteredDomain[]>([]);

  const loadRegisteredDomains = async () => {
    if (!contract) return;
    try {
      const filter = contract.filters.DomainRegistered(null, null, null);
      const events = await contract.queryFilter(filter, 0, 'latest');
      const domains = events.map((event) => ({
        tokenId: event.args.tokenId.toString(),
        name: event.args.name + '.vc',
        owner: event.args.owner,
        blockNumber: event.blockNumber,
      }));
      setRegisteredDomains(domains);
    } catch (error) {
      console.error('Load registered domains error:', parseError(error));
    }
  };

  const loadHistory = async () => {
    if (!contract || !userAddress || !provider) {
      setHistory([]);
      return;
    }
    try {
      const filters = [
        contract.filters.DomainRegistered(null, null, null),
        contract.filters.DomainListed(null),
        contract.filters.DomainSold(null, userAddress),
        contract.filters.Transfer(null, userAddress),
        contract.filters.Transfer(userAddress, null),
      ];
      const events = (await Promise.all(filters.map((f) => contract.queryFilter(f, 0, 'latest'))))
        .flat()
        .filter((event) => {
          if (event.event === 'DomainRegistered') {
            const domainEntry = registeredDomains.find((d) => d.tokenId === event.args.tokenId.toString());
            return domainEntry && domainEntry.owner.toLowerCase() === userAddress.toLowerCase();
          }
          return true;
        })
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 20);
      const historyWithDates = await Promise.all(
        events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          return { ...event, date: new Date(block.timestamp * 1000).toLocaleString() };
        }),
      );
      setHistory(historyWithDates);
    } catch (error) {
      setHistory([]);
      console.error('History load error:', parseError(error));
    }
  };

  useEffect(() => {
    loadRegisteredDomains();
  }, [contract]);

  useEffect(() => {
    if (registeredDomains.length) {
      loadHistory();
    }
  }, [contract, userAddress, registeredDomains]);

  return (
    <section className={styles.card}>
      <h2>Transaction History</h2>
      <div className={styles.cardGrid}>
        {history.length ? (
          history.map((event, index) => {
            const domainEntry = registeredDomains.find((d) => d.tokenId === event.args.tokenId.toString());
            const name = domainEntry ? domainEntry.name : `domain${event.args.tokenId.toString().slice(0, 8)}.vc`;
            let details = '';
            if (event.event === 'DomainRegistered') {
              details = `Registered ${name} by ${event.args.owner.slice(0, 6)}...${event.args.owner.slice(-4)}`;
            } else if (event.event === 'DomainListed') {
              details = `Listed ${name} for ${ethers.utils.formatEther(event.args.price)} VC`;
            } else if (event.event === 'DomainSold') {
              details = `Sold ${name} to ${event.args.buyer.slice(0, 6)}...${event.args.buyer.slice(-4)} for ${ethers.utils.formatEther(event.args.price)} VC`;
            } else if (event.event === 'Transfer') {
              details = `Transferred ${name} from ${event.args.from.slice(0, 6)}...${event.args.from.slice(-4)} to ${event.args.to.slice(0, 6)}...${event.args.to.slice(-4)}`;
            }
            return (
              <div key={index} className={styles.historyItem}>
                <p>{event.date}: {details}</p>
              </div>
            );
          })
        ) : (
          <p className={styles.historyItem}>{status || 'No recent transactions'}</p>
        )}
      </div>
    </section>
  );
};

export default History;
