import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  const { userAddress, connectWallet } = useWallet();

  return (
    <section className={styles.card}>
      <h1>Welcome to VinuHub .vc Domain Service</h1>
      <p>Register, manage, and trade .vc domains on VinuChain.</p>
      {userAddress ? (
        <div className={styles.actions}>
          <Link to="/register" className={styles.button}>
            Register a Domain
          </Link>
          <Link to="/dashboard" className={styles.button}>
            View Dashboard
          </Link>
        </div>
      ) : (
        <button onClick={() => connectWallet(true)} className={styles.button}>
          Connect Wallet to Start
        </button>
      )}
    </section>
  );
};

export default Home;
