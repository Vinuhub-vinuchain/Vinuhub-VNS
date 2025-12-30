import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getRegistrationFee, parseError } from '../utils/helpers';
import  '../styles/Register.module.css';
import { ethers } from 'ethers';

const Register: React.FC = () => {
  const { contract, provider, userAddress, status } = useWallet();
  const [domain, setDomain] = useState('');
  const [fee, setFee] = useState<string | null>(null);
  const [registerStatus, setRegisterStatus] = useState('');

  const updateFee = () => {
    if (!domain) {
      setFee(null);
      return;
    }
    const calculatedFee = getRegistrationFee(domain.replace('.vc', ''));
    setFee(ethers.utils.formatEther(calculatedFee));
  };

  const handleRegister = async () => {
    if (!contract || !provider || !userAddress) {
      setRegisterStatus('Wallet not connected');
      return;
    }
    const name = domain.replace('.vc', '');
    if (!name || !/^[a-zA-Z0-9]+$/.test(name)) {
      setRegisterStatus('Invalid domain name (alphanumeric only)');
      return;
    }
    try {
      const fee = getRegistrationFee(name);
      const balance = await provider.getBalance(userAddress);
      const gasPrice = await provider.getGasPrice();
      const gasEstimate = await contract.estimateGas.register(name, { value: fee });
      const gasCost = gasPrice.mul(gasEstimate).mul(2); // Buffer for gas fluctuations
      const totalCost = fee.add(gasCost);
      if (balance.lt(totalCost)) {
        throw new Error(`Insufficient VC balance. Need ${ethers.utils.formatEther(totalCost)} VC (Fee: ${ethers.utils.formatEther(fee)}, Gas: ${ethers.utils.formatEther(gasCost)}), have ${ethers.utils.formatEther(balance)} VC.`);
      }
      const tx = await contract.register(name, { value: fee, gasLimit: gasEstimate.mul(2) });
      await tx.wait();
      setRegisterStatus(`Domain ${name}.vc registered successfully! Tx: ${tx.hash}`);
    } catch (error) {
      setRegisterStatus(`Registration failed: ${parseError(error)}`);
    }
  };

  useEffect(() => {
    updateFee();
  }, [domain]);

  return (
    <section className='card'>
      <h2>Register Now</h2>
      <div className='inputGroup'>
        <label htmlFor="domainInput">Domain Name</label>
        <input
          id="domainInput"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter name (e.g., example)"
        />
        <p>Fee: {fee ? `${fee} VC` : 'Enter a domain name'}</p>
        <button onClick={handleRegister} disabled={!domain || !contract}>
          Register .vc
        </button>
      </div>
      <p>{registerStatus || status}</p>
    </section>
  );
};

export default Register;
