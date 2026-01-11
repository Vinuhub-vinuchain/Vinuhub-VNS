import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const Header: React.FC = () => {
  const { userAddress, connectWallet, disconnectWallet, status } = useWallet();

  return (
    <header>
      <div className="logo">
        <img src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png" alt="VinuHub Logo" />
      </div>
      <i className="fas fa-bars hamburger"></i>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/transfer">Transfer</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/history">History</Link>
      </nav>
      <div className="header-controls">
        <button id="connectWallet" onClick={() => connectWallet()}>
          <i className="fas fa-wallet"></i> Connect Wallet
        </button>
        <button id="disconnectWallet" style={{ display: userAddress ? 'block' : 'none' }} onClick={disconnectWallet}>
          <i className="fas fa-sign-out-alt"></i> Disconnect Wallet
        </button>
      </div>
    </header>
  );
};

export default Header;
