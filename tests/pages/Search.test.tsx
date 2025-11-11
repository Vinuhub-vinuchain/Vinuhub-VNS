import { render, screen, fireEvent } from '@testing-library/react';
import Search from '../../src/pages/Search';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('Search Component', () => {
  const mockContract = {
    nameToTokenId: jest.fn().mockResolvedValue(ethers.BigNumber.from('0')),
    nameToExpiry: jest.fn().mockResolvedValue(ethers.BigNumber.from('0')),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, userAddress: '0x123', status: '', ...mockContext }}>
        <Search />
      </WalletProvider>,
    );

  it('renders Search component', () => {
    renderWithProvider();
    expect(screen.getByText('Search Domains')).toBeInTheDocument();
  });

  it('shows availability when domain is available', async () => {
    renderWithProvider();
    const input = screen.getByLabelText('Domain Name');
    const button = screen.getByText('Check Availability');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);
    expect(await screen.findByText('test.vc is available')).toBeInTheDocument();
  });

  it('shows taken when domain is taken', async () => {
    renderWithProvider({
      contract: {
        nameToTokenId: jest.fn().mockResolvedValue(ethers.BigNumber.from('1')),
        nameToExpiry: jest.fn().mockResolvedValue(ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 1000)),
      },
    });
    const input = screen.getByLabelText('Domain Name');
    const button = screen.getByText('Check Availability');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);
    expect(await screen.findByText('test.vc is taken')).toBeInTheDocument();
  });

  it('shows error for invalid domain', async () => {
    renderWithProvider();
    const input = screen.getByLabelText('Domain Name');
    const button = screen.getByText('Check Availability');
    fireEvent.change(input, { target: { value: 'test@' } });
    fireEvent.click(button);
    expect(await screen.findByText('Invalid domain name (alphanumeric only)')).toBeInTheDocument();
  });
});
