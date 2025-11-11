import { render, screen } from '@testing-library/react';
import History from '../../src/pages/History';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('History Component', () => {
  const mockContract = {
    queryFilter: jest.fn().mockImplementation((filter) => {
      if (filter.name === 'DomainRegistered') {
        return [
          {
            event: 'DomainRegistered',
            args: { tokenId: ethers.BigNumber.from('1'), name: 'test', owner: '0x123' },
            blockNumber: 1000,
          },
        ];
      }
      return [];
    }),
  };
  const mockProvider = {
    getBlock: jest.fn().mockResolvedValue({ timestamp: Math.floor(Date.now() / 1000) }),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, userAddress: '0x123', provider: mockProvider, status: '', ...mockContext }}>
        <History />
      </WalletProvider>,
    );

  it('renders History component', () => {
    renderWithProvider();
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('displays transaction history', async () => {
    renderWithProvider();
    expect(await screen.findByText(/Registered test.vc by 0x123/)).toBeInTheDocument();
  });

  it('shows no transactions when no history', async () => {
    renderWithProvider({ contract: { queryFilter: jest.fn().mockResolvedValue([]) } });
    expect(await screen.findByText('No recent transactions')).toBeInTheDocument();
  });

  it('shows status when wallet not connected', async () => {
    renderWithProvider({ contract: null, status: 'Please connect your wallet.' });
    expect(await screen.findByText('Please connect your wallet.')).toBeInTheDocument();
  });
});
