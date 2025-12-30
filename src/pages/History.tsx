import React, { useEffect, useState } from 'react';
import { ethers, Event } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { RegisteredDomain } from '../types';
import { parseError } from '../utils/helpers';

interface HistoryEvent extends Event {
  date: string;
}

const History: React.FC = () => {
  const { contract, userAddress, provider, status } = useWallet();
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [registeredDomains, setRegisteredDomains] = useState<RegisteredDomain[]>([]);

  const loadRegisteredDomains = async () => {
    if (!contract) return;

    try {
      const filter = contract.filters.DomainRegistered(null, null, null);
      const events = await contract.queryFilter(filter, 0, 'latest');

      const domains: RegisteredDomain[] = [];

      for (const event of events) {
        if (!event.args) continue;

        domains.push({
          tokenId: event.args.tokenId.toString(),
          name: `${event.args.name}.vc`,
          owner: event.args.owner,
          blockNumber: event.blockNumber,
          expiry: 0, // fallback for missing expiry; adjust if needed
        });
      }

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
      ];

      const eventsRaw = (
        await Promise.all(filters.map((f) => contract.queryFilter(f, 0, 'latest')))
      ).flat();

      const events = eventsRaw
        .filter((event) => event.args !== undefined)
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 20);

      const eventsWithDates: HistoryEvent[] = [];

      for (const event of events) {
        const block = await provider.getBlock(event.blockNumber);
        eventsWithDates.push({
          ...event,
          date: new Date(block.timestamp * 1000).toLocaleString(),
        });
      }

      setHistory(eventsWithDates);
    } catch (error) {
      console.error('History load error:', parseError(error));
      setHistory([]);
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
    <section className="card">
      <h2>Transaction History</h2>
      <div className="cardGrid">
        {history.length > 0 ? (
          history.map((event, index) => {
            if (!event.args) return null;

            const domainEntry = registeredDomains.find(
  (d) => event.args && d.tokenId === event.args.tokenId.toString()
);


            const name = domainEntry?.name ?? `domain${event.args.tokenId?.toString().slice(0, 6)}.vc`;

            let details = '';

            switch (event.event) {
              case 'DomainRegistered':
                details = `Registered ${name} by ${event.args.owner.slice(0, 6)}...${event.args.owner.slice(-4)}`;
                break;
              case 'DomainListed':
                details = `Listed ${name} for ${ethers.utils.formatEther(event.args.price)} VC`;
                break;
              case 'DomainSold':
                details = `Sold ${name} to ${event.args.buyer.slice(0, 6)}...${event.args.buyer.slice(-4)} for ${ethers.utils.formatEther(event.args.price)} VC`;
                break;
              default:
                details = event.event ?? 'unknown event';
            }

            return (
              <div key={index} className="historyItem">
                <p>
                  {event.date}: {details}
                </p>
              </div>
            );
          })
        ) : (
          <p className="historyItem">{status || 'No recent transactions'}</p>
        )}
      </div>
    </section>
  );
};

export default History;
