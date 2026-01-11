
// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import styles from '../styles/Header.module.css';

const Header: React.FC = () => {
  const { userAddress, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
          alt="VinuHub Logo"
        />
      </div>
      <i className="fas fa-bars hamburger" onClick={() => document.querySelector('nav')?.classList.toggle('active')}></i>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/transfer">Transfer</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/history">History</Link>
      </nav>
      <div className={styles.headerControls}>
        <button onClick={connectWallet}>
          <i className="fas fa-wallet"></i> Connect Wallet
        </button>
        {userAddress && (
          <button onClick={disconnectWallet}>
            <i className="fas fa-sign-out-alt"></i> Disconnect
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
