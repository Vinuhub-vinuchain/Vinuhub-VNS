import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import Register from './pages/Register';
import Transfer from './pages/Transfer';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { WalletProvider } from './hooks/useWallet';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="container">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<Register />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
          <footer>
            <p>Powered by VinuChain © 2025</p>
            <div className="social">
              <a href="https://t.me/Vinuhub" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-telegram"></i> Join Telegram
              </a>
            </div>
          </footer>
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;
