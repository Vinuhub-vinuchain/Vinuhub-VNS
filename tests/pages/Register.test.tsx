import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../../src/pages/Register';
import { WalletProvider } from '../../src/hooks/useWallet';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('Register Component', () => {
  const mockContract = {
    register: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0x123' }) }),
    estimateGas: { register: jest.fn().mockResolvedValue(ethers.BigNumber.from('100000')) },
  };
  const mockProvider = {
    getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('30000')),
    getGasPrice: jest.fn().mockResolvedValue(ethers.utils.parseEther('0.0001')),
  };

  const renderWithProvider = (mockContext = {}) =>
    render(
      <WalletProvider value={{ contract: mockContract, provider: mockProvider, userAddress: '0x123', status: '', ...mockContext }}>
        <Register />
      </WalletProvider>,
    );

  it('renders Register component', () => {
    renderWithProvider();
    expect(screen.getByText('Register Now')).toBeInTheDocument();
  });

  it('displays fee for short domain (≤5 letters)', () => {
    renderWithProvider();
    const input = screen.getByLabelText('Domain Name');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByText('Fee: 20000 VC')).toBeInTheDocument();
  });

  it('displays fee for long domain (>5 letters)', () => {
    renderWithProvider();
    const input = screen.getByLabelText('Domain Name');
    fireEvent.change(input, { target: { value: 'example' } });
    expect(screen.getByText('Fee: 10000 VC')).toBeInTheDocument();
  });

  it('handles registration successfully', async () => {
    renderWithProvider();
    const input = screen.getByLabelText('Domain Name');
    const button = screen.getByText('Register .vc');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);
    expect(mockContract.register).toHaveBeenCalledWith('test', expect.any(Object));
    expect(await screen.findByText(/Domain test.vc registered successfully/)).toBeInTheDocument();
  });

  it('shows error for insufficient balance', async () => {
    renderWithProvider({ provider: { ...mockProvider, getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('1000')) } });
    const input = screen.getByLabelText('Domain Name');
    const button = screen.getByText('Register .vc');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);
    expect(await screen.findByText(/Insufficient VC balance/)).toBeInTheDocument();
  });
});
