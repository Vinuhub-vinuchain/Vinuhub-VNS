import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import  '../styles/Home.module.css';

const Home: React.FC = () => {
  const { userAddress, connectWallet } = useWallet();

  return (
    <section className='card'>
      <h1>Welcome to VinuHub .vc Domain Service</h1>
      <p>Register, manage, and trade .vc domains on VinuChain.</p>
      {userAddress ? (
        <div className='actions'>
          <Link to="/register" className='button'>
            Register a Domain
          </Link>
          <Link to="/dashboard" className='button'>
            View Dashboard
          </Link>
        </div>
      ) : (
        <button onClick={connectWallet} className='button'>
          Connect Wallet to Start
        </button>
      )}
    </section>
  );
};

export default Home;

