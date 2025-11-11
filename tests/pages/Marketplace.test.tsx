import { render, screen, fireEvent } from '@testing-library/react';
import Marketplace from '../../src/pages/Marketplace';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('Marketplace Component', () => {
  const mockContract = {
    tokenIdToPrice: jest.fn().mockResolvedValue(ethers.utils.parseEther('500')),
    listForSale: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    buyDomain: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    nameToTokenId: jest.fn().mockResolvedValue(ethers.BigNumber.from('1')),
    queryFilter: jest.fn().mockResolvedValue([
      {
        args: { tokenId: ethers.BigNumber.from('1'), name: 'test', owner: '0x1234567890abcdef1234567890abcdef12345678' },
        blockNumber: 1000,
      },
    ]),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, userAddress: '0xabcdef1234567890abcdef1234567890abcdef12', status: '', ...mockContext }}>
        <Marketplace />
      </WalletProvider>,
    );

  it('renders Marketplace component', () => {
    renderWithProvider();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('List a Domain')).toBeInTheDocument();
  });

  it('displays domains for sale', async () => {
    renderWithProvider();
    expect(await screen.findByText('test.vc')).toBeInTheDocument();
    expect(screen.getByText('Price: 500 VC')).toBeInTheDocument();
  });

  it('handles listing a domain', async () => {
    renderWithProvider();
    const domainInput = screen.getByLabelText('Domain Name');
    const priceInput = screen.getByLabelText('Price (VC)');
    const button = screen.getByText('List for Sale');
    fireEvent.change(domainInput, { target: { value: 'test' } });
    fireEvent.change(priceInput, { target: { value: '500' } });
    fireEvent.click(button);
    expect(mockContract.listForSale).toHaveBeenCalledWith('test', expect.any(ethers.BigNumber));
    expect(await screen.findByText(/Listed test.vc for 500 VC successfully/)).toBeInTheDocument();
  });

  it('handles buying a domain', async () => {
    renderWithProvider();
    const button = await screen.findByText('Buy');
    fireEvent.click(button);
    expect(mockContract.buyDomain).toHaveBeenCalledWith('test', expect.any(Object));
    expect(await screen.findByText(/Bought test.vc for 500 VC successfully/)).toBeInTheDocument();
  });

  it('disables Buy button for own domain', async () => {
    renderWithProvider({ userAddress: '0x1234567890abcdef1234567890abcdef12345678' });
    const button = await screen.findByText('Buy');
    expect(button).toBeDisabled();
  });
});
