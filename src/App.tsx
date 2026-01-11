'use client';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import Register from './pages/Register';
import Transfer from './pages/Transfer';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { WalletProvider } from './hooks/useWallet';
import './styles/global.css'; // Your global styles

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="container">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/register" element={<Register />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </WalletProvider>
  );
}
