import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import '../styles/Header.module.css';

const Header: React.FC = () => {
  const { userAddress, connectWallet, disconnectWallet, status } = useWallet();

  return (
    <header className='header'>
      <div className='logo'>
        <Link to="/">VinuHub .vc</Link>
      </div>
      <nav className='nav'>
        <Link to="/search">Search</Link>
        <Link to="/register">Register</Link>
        <Link to="/transfer">Transfer</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/history">History</Link>
      </nav>
      <div className='wallet'>
        {userAddress ? (
          <>
            <span>{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}</span>
            <button onClick={disconnectWallet}>Disconnect</button>
          </>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>

        )}
      </div>
      {status && <p className='status'>{status}</p>}
    </header>
  );
};

export default Header;
