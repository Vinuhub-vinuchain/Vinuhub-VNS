import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError, getRegistrationFee } from '../utils/helpers';
import { RegisteredDomain } from '../types';
import styles from '../styles/Dashboard.module.css';
import { ethers } from 'ethers';

const Dashboard: React.FC = () => {
  const { contract, userAddress, provider, status } = useWallet();
  const [domains, setDomains] = useState<RegisteredDomain[]>([]);
  const [content, setContent] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [dashStatus, setDashStatus] = useState('');

  const loadDomains = async () => {
    if (!contract || !userAddress) return;
    try {
      const filter = contract.filters.DomainRegistered(null, null, userAddress);
      const events = await contract.queryFilter(filter, 0, 'latest');
      const domainList = await Promise.all(
        events.map(async (event) => {
          const name = event.args.name;
          const expiry = await contract.nameToExpiry(name);
          return {
            tokenId: event.args.tokenId.toString(),
            name: name + '.vc',
            owner: event.args.owner,
            blockNumber: event.blockNumber,
            expiry: expiry.toNumber(),
          };
        }),
      );
      setDomains(domainList.filter((d) => d.expiry > Math.floor(Date.now() / 1000)));
    } catch (error) {
      setDashStatus(`Error loading domains: ${parseError(error)}`);
    }
  };

  const handleSetContent = async () => {
    if (!contract || !userAddress) {
      setDashStatus('Wallet not connected');
      return;
    }
    const name = selectedDomain.replace('.vc', '');
    if (!name || !content) {
      setDashStatus('Please select domain and enter content');
      return;
    }
    try {
      const tx = await contract.setContent(name, content);
      await tx.wait();
      setDashStatus(`Content set for ${name}.vc successfully! Tx: ${tx.hash}`);
    } catch (error) {
      setDashStatus(`Set content failed: ${parseError(error)}`);
    }
  };

  const handleRenew = async (name: string) => {
    if (!contract || !userAddress || !provider) {
      setDashStatus('Wallet not connected');
      return;
    }
    const domainName = name.replace('.vc', '');
    try {
      const fee = getRegistrationFee(domainName);
      const balance = await provider.getBalance(userAddress);
      const gasPrice = await provider.getGasPrice();
      const gasEstimate = await contract.estimateGas.renew(domainName, { value: fee });
      const gasCost = gasPrice.mul(gasEstimate).mul(2);
      const totalCost = fee.add(gasCost);
      if (balance.lt(totalCost)) {
        throw new Error(`Insufficient VC balance. Need ${ethers.utils.formatEther(totalCost)} VC.`);
      }
      const tx = await contract.renew(domainName, { value: fee, gasLimit: gasEstimate.mul(2) });
      await tx.wait();
      setDashStatus(`Renewed ${name} successfully! Tx: ${tx.hash}`);
      loadDomains();
    } catch (error) {
      setDashStatus(`Renew failed: ${parseError(error)}`);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [contract, userAddress]);

  return (
    <section className={styles.card}>
      <h2>Your Domains</h2>
      <div className={styles.cardGrid}>
        {domains.length ? (
          domains.map((domain) => (
            <div key={domain.tokenId} className={styles.domainItem}>
              <p>{domain.name}</p>
              <p>Expires: {new Date(domain.expiry * 1000).toLocaleDateString()}</p>
              <button onClick={() => handleRenew(domain.name)} disabled={!contract}>
                Renew
              </button>
            </div>
          ))
        ) : (
          <p>No domains owned</p>
        )}
      </div>
      <div className={styles.inputGroup}>
        <h3>Set Content</h3>
        <label htmlFor="domainSelect">Select Domain</label>
        <select
          id="domainSelect"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="">Select a domain</option>
          {domains.map((domain) => (
            <option key={domain.tokenId} value={domain.name}>
              {domain.name}
            </option>
          ))}
        </select>
        <label htmlFor="contentInput">Content</label>
        <input
          id="contentInput"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content (e.g., IPFS hash)"
        />
        <button onClick={handleSetContent} disabled={!selectedDomain || !content || !contract}>
          Set Content
        </button>
      </div>
      <p>{dashStatus || status}</p>
    </section>
  );
};

export default Dashboard;
