import { render, screen, fireEvent } from '@testing-library/react';
import Transfer from '../../src/pages/Transfer';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('Transfer Component', () => {
  const mockContract = {
    transferWithDomain: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    setAddress: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, userAddress: '0x123', status: '', ...mockContext }}>
        <Transfer />
      </WalletProvider>,
    );

  it('renders Transfer component', () => {
    renderWithProvider();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('Transfer Tokens')).toBeInTheDocument();
    expect(screen.getByText('Transfer Domain Ownership')).toBeInTheDocument();
  });

  it('handles token transfer', async () => {
    renderWithProvider();
    const domainInput = screen.getByLabelText('Domain Name');
    const amountInput = screen.getByLabelText('Amount (VC)');
    const button = screen.getByText('Transfer Tokens');
    fireEvent.change(domainInput, { target: { value: 'test' } });
    fireEvent.change(amountInput, { target: { value: '1.5' } });
    fireEvent.click(button);
    expect(mockContract.transferWithDomain).toHaveBeenCalledWith('test', expect.any(ethers.BigNumber), expect.any(Object));
    expect(await screen.findByText(/Transferred 1.5 VC to test.vc successfully/)).toBeInTheDocument();
  });

  it('handles domain transfer', async () => {
    renderWithProvider();
    const domainInput = screen.getByLabelText('Domain Name');
    const addressInput = screen.getByLabelText('New Address');
    const button = screen.getByText('Transfer Domain');
    fireEvent.change(domainInput, { target: { value: 'test' } });
    fireEvent.change(addressInput, { target: { value: '0xabcdef1234567890abcdef1234567890abcdef12' } });
    fireEvent.click(button);
    expect(mockContract.setAddress).toHaveBeenCalledWith('test', '0xabcdef1234567890abcdef1234567890abcdef12');
    expect(await screen.findByText(/Transferred test.vc to 0xabcdef1234567890abcdef1234567890abcdef12 successfully/)).toBeInTheDocument();
  });

  it('shows error when wallet not connected', async () => {
    renderWithProvider({ contract: null });
    const button = screen.getByText('Transfer Tokens');
    fireEvent.click(button);
    expect(await screen.findByText('Wallet not connected')).toBeInTheDocument();
  });
});
