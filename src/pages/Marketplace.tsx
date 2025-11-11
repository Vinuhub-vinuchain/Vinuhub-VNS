import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError, getRegistrationFee } from '../utils/helpers';
import { RegisteredDomain } from '../types';
import styles from '../styles/Marketplace.module.css';
import { ethers } from 'ethers';

const Marketplace: React.FC = () => {
  const { contract, userAddress, status } = useWallet();
  const [domains, setDomains] = useState<RegisteredDomain[]>([]);
  const [listDomain, setListDomain] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [marketStatus, setMarketStatus] = useState('');

  const loadDomains = async () => {
    if (!contract) return;
    try {
      const filter = contract.filters.DomainRegistered(null, null, null);
      const events = await contract.queryFilter(filter, 0, 'latest');
      const domainList = await Promise.all(
        events.map(async (event) => {
          const tokenId = event.args.tokenId.toString();
          const price = await contract.tokenIdToPrice(tokenId);
          return {
            tokenId,
            name: event.args.name + '.vc',
            owner: event.args.owner,
            blockNumber: event.blockNumber,
            price: price.toString(),
          };
        }),
      );
      setDomains(domainList.filter((d) => ethers.BigNumber.from(d.price).gt(0)));
    } catch (error) {
      setMarketStatus(`Error loading domains: ${parseError(error)}`);
    }
  };

  const handleList = async () => {
    if (!contract || !userAddress) {
      setMarketStatus('Wallet not connected');
      return;
    }
    const name = listDomain.replace('.vc', '');
    if (!name || !listPrice) {
      setMarketStatus('Please enter domain and price');
      return;
    }
    try {
      const weiPrice = ethers.utils.parseEther(listPrice);
      const tx = await contract.listForSale(name, weiPrice);
      await tx.wait();
      setMarketStatus(`Listed ${name}.vc for ${listPrice} VC successfully! Tx: ${tx.hash}`);
      loadDomains();
    } catch (error) {
      setMarketStatus(`Listing failed: ${parseError(error)}`);
    }
  };

  const handleBuy = async (name: string) => {
    if (!contract || !userAddress) {
      setMarketStatus('Wallet not connected');
      return;
    }
    const domainName = name.replace('.vc', '');
    try {
      const tokenId = await contract.nameToTokenId(domainName);
      const price = await contract.tokenIdToPrice(tokenId);
      const tx = await contract.buyDomain(domainName, { value: price });
      await tx.wait();
      setMarketStatus(`Bought ${name} for ${ethers.utils.formatEther(price)} VC successfully! Tx: ${tx.hash}`);
      loadDomains();
    } catch (error) {
      setMarketStatus(`Purchase failed: ${parseError(error)}`);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [contract]);

  return (
    <section className={styles.card}>
      <h2>Marketplace</h2>
      <div className={styles.inputGroup}>
        <h3>List a Domain</h3>
        <label htmlFor="listDomainInput">Domain Name</label>
        <input
          id="listDomainInput"
          type="text"
          value={listDomain}
          onChange={(e) => setListDomain(e.target.value)}
          placeholder="Enter name (e.g., example)"
        />
        <label htmlFor="listPriceInput">Price (VC)</label>
        <input
          id="listPriceInput"
          type="text"
          value={listPrice}
          onChange={(e) => setListPrice(e.target.value)}
          placeholder="Enter price (e.g., 500)"
        />
        <button onClick={handleList} disabled={!listDomain || !listPrice || !contract}>
          List for Sale
        </button>
      </div>
      <h3>Domains for Sale</h3>
      <div className={styles.cardGrid}>
        {domains.length ? (
          domains.map((domain) => (
            <div key={domain.tokenId} className={styles.domainItem}>
              <p>{domain.name}</p>
              <p>Price: {ethers.utils.formatEther(domain.price)} VC</p>
              <p>Owner: {`${domain.owner.slice(0, 6)}...${domain.owner.slice(-4)}`}</p>
              <button
                onClick={() => handleBuy(domain.name)}
                disabled={domain.owner.toLowerCase() === userAddress?.toLowerCase() || !contract}
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <p>No domains listed for sale</p>
        )}
      </div>
      <p>{marketStatus || status}</p>
    </section>
  );
};

export default Marketplace;
