import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('Dashboard Component', () => {
  const mockContract = {
    queryFilter: jest.fn().mockResolvedValue([
      {
        args: { tokenId: ethers.BigNumber.from('1'), name: 'test', owner: '0x123' },
        blockNumber: 1000,
      },
    ]),
    nameToExpiry: jest.fn().mockResolvedValue(ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 1000)),
    setContent: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    renew: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    estimateGas: { renew: jest.fn().mockResolvedValue(ethers.BigNumber.from('100000')) },
  };
  const mockProvider = {
    getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('30000')),
    getGasPrice: jest.fn().mockResolvedValue(ethers.utils.parseEther('0.0001')),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, userAddress: '0x123', provider: mockProvider, status: '', ...mockContext }}>
        <Dashboard />
      </WalletProvider>,
    );

  it('renders Dashboard component', () => {
    renderWithProvider();
    expect(screen.getByText('Your Domains')).toBeInTheDocument();
  });

  it('displays owned domains', async () => {
    renderWithProvider();
    expect(await screen.findByText('test.vc')).toBeInTheDocument();
  });

  it('handles setting content', async () => {
    renderWithProvider();
    const select = screen.getByLabelText('Select Domain');
    const input = screen.getByLabelText('Content');
    const button = screen.getByText('Set Content');
    fireEvent.change(select, { target: { value: 'test.vc' } });
    fireEvent.change(input, { target: { value: 'ipfs://hash' } });
    fireEvent.click(button);
    expect(mockContract.setContent).toHaveBeenCalledWith('test', 'ipfs://hash');
    expect(await screen.findByText(/Content set for test.vc successfully/)).toBeInTheDocument();
  });

  it('handles renewing a domain', async () => {
    renderWithProvider();
    const button = await screen.findByText('Renew');
    fireEvent.click(button);
    expect(mockContract.renew).toHaveBeenCalledWith('test', expect.any(Object));
    expect(await screen.findByText(/Renewed test.vc successfully/)).toBeInTheDocument();
  });

  it('shows error for insufficient balance', async () => {
    renderWithProvider({ provider: { ...mockProvider, getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('1000')) } });
    const button = await screen.findByText('Renew');
    fireEvent.click(button);
    expect(await screen.findByText(/Insufficient VC balance/)).toBeInTheDocument();
  });
});
