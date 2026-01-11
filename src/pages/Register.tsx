'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseError } from '../utils/helpers';
import { ethers } from 'ethers';
import styles from '../styles/Register.module.css';

const Register: React.FC = () => {
  const { contract, userAddress } = useWallet();
  const [domain, setDomain] = useState('');
  const [fee, setFee] = useState<string>('Enter domain name');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const name = domain.trim().replace('.vc', '');
    if (name) {
      const calculatedFee = name.length <= 5 ? '20000' : '10000';
      setFee(`Fee: ${calculatedFee} VC`);
    } else {
      setFee('Fee: Enter domain name');
    }
  }, [domain]);

  const handleRegister = async () => {
    if (!contract || !userAddress) return;
    const name = domain.trim().replace('.vc', '');
    if (!name) return;

    const feeValue = name.length <= 5 ? ethers.utils.parseEther('20000') : ethers.utils.parseEther('10000');
    try {
      const tx = await contract.register(name, { value: feeValue });
      await tx.wait();
      setStatus(`Registered ${name}.vc! Tx: ${tx.hash}`);
    } catch (error) {
      setStatus(`Failed: ${parseError(error)}`);
    }
  };

  return (
    <section id="register" className={styles.card}>
      <h2>Register Now</h2>
      <p>{fee}</p>
      <div className={styles.inputGroup}>
        <label htmlFor="domainInput">Domain Name</label>
        <input
          id="domainInput"
          type="text"
          placeholder="Enter name (e.g., example)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button onClick={handleRegister} disabled={!domain || !contract}>
          <i className="fas fa-plus"></i> Register .vc
        </button>
      </div>
      <p>{status}</p>
    </section>
  );
};

export default Register;
