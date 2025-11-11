import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/components/Header';
import { WalletProvider } from '../../src/hooks/useWallet';

describe('Header Component', () => {
  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ userAddress: null, connectWallet: jest.fn(), disconnectWallet: jest.fn(), status: '', ...mockContext }}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </WalletProvider>,
    );

  it('renders Header with navigation links', () => {
    renderWithProvider();
    expect(screen.getByText('VinuHub .vc')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('shows Connect Wallet button when not connected', () => {
    renderWithProvider();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows Disconnect button and address when connected', () => {
    renderWithProvider({ userAddress: '0x1234567890abcdef1234567890abcdef12345678' });
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('calls connectWallet on button click', () => {
    const connectWallet = jest.fn();
    renderWithProvider({ connectWallet });
    fireEvent.click(screen.getByText('Connect Wallet'));
    expect(connectWallet).toHaveBeenCalledWith(true);
  });

  it('calls disconnectWallet on button click', () => {
    const disconnectWallet = jest.fn();
    renderWithProvider({ userAddress: '0x1234567890abcdef1234567890abcdef12345678', disconnectWallet });
    fireEvent.click(screen.getByText('Disconnect'));
    expect(disconnectWallet).toHaveBeenCalled();
  });
});
