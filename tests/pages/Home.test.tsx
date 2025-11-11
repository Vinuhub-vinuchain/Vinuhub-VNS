import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';
import { WalletProvider } from '../../src/hooks/useWallet';

describe('Home Component', () => {
  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ userAddress: null, connectWallet: jest.fn(), status: '', ...mockContext }}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </WalletProvider>,
    );

  it('renders Home page', () => {
    renderWithProvider();
    expect(screen.getByText('Welcome to VinuHub .vc Domain Service')).toBeInTheDocument();
    expect(screen.getByText('Register, manage, and trade .vc domains on VinuChain.')).toBeInTheDocument();
  });

  it('shows Connect Wallet button when not connected', () => {
    renderWithProvider();
    expect(screen.getByText('Connect Wallet to Start')).toBeInTheDocument();
  });

  it('shows Register and Dashboard links when connected', () => {
    renderWithProvider({ userAddress: '0x1234567890abcdef1234567890abcdef12345678' });
    expect(screen.getByText('Register a Domain')).toBeInTheDocument();
    expect(screen.getByText('View Dashboard')).toBeInTheDocument();
  });

  it('calls connectWallet on button click', () => {
    const connectWallet = jest.fn();
    renderWithProvider({ connectWallet });
    fireEvent.click(screen.getByText('Connect Wallet to Start'));
    expect(connectWallet).toHaveBeenCalledWith(true);
  });
});
