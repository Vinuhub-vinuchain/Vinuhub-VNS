require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    vinuchain: {
      url: 'https://rpc.vinuchain.org',
      accounts: [process.env.PRIVATE_KEY], // Add private key for deployment
    },
  },
};
