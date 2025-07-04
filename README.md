# DeCRiCo - Transparent Disaster Aid Tracking Platform

![DeCRiCo](https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop)

## 🌍 Project Overview

DeCRiCo is a decentralized disaster relief coordination platform built on Ethereum that enables transparent, trustless aid distribution. The platform connects verified aid requests with donors through smart contracts, eliminating intermediaries and ensuring complete transparency in disaster relief efforts.

### 🎯 Mission Statement

To create a transparent, community-driven disaster relief ecosystem where every donation is tracked on-chain, aid requests are verified by the community, and funds reach those who need them most without bureaucratic delays.

## ✨ Key Features

### 🔐 Core Functionality
- **Smart Contract Integration**: Built on Ethereum with OpenZeppelin security patterns
- **Transparent Donations**: All transactions recorded immutably on blockchain
- **Community Verification**: Decentralized verification system for aid requests
- **Real-time Tracking**: Live progress tracking for all funding goals
- **Reputation System**: Trust scoring for creators and contributors
- **Governance System**: Community voting on platform improvements

### 💻 User Experience
- **Role-based Access**: Different interfaces for donors, requesters, verifiers, and admins
- **Intuitive Interface**: Clean, modern design with Apple-level aesthetics
- **Wallet Integration**: Seamless MetaMask connection and transaction handling
- **Mobile Responsive**: Optimized for all devices and screen sizes
- **Real-time Updates**: Live progress bars and notification system
- **Multi-category Support**: Emergency, Medical, Housing, Food, Education, Infrastructure

### 🛡️ Security & Trust
- **On-chain Verification**: All requests and donations verified on Ethereum
- **IPFS Documentation**: Immutable storage for proof documents
- **Reputation Tracking**: Community-driven trust system
- **Transparent Fees**: Clear breakdown of all transaction costs
- **Reentrancy Protection**: Smart contracts secured against common attacks

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive, utility-first styling
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography
- **React Router** for seamless navigation

### Blockchain Integration
- **Ethereum** blockchain for smart contract deployment
- **Ethers.js v6** for Web3 interaction
- **OpenZeppelin** contracts for security patterns
- **MetaMask** wallet integration
- **Hardhat** for smart contract development

### Smart Contracts
- **AidRequestContract.sol**: Manages aid requests and donations
- **GovernanceContract.sol**: Handles community proposals and voting
- **ReputationContract.sol**: Tracks user reputation and verification status

## 🏗️ Project Structure

```
├── contracts/                 # Smart contracts
│   ├── AidRequestContract.sol # Main aid request functionality
│   ├── GovernanceContract.sol # Community governance
│   ├── ReputationContract.sol # User reputation system
│   ├── scripts/deploy.js      # Deployment scripts
│   └── hardhat.config.js      # Hardhat configuration
├── src/
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Main application pages
│   ├── utils/                 # Utility functions
│   └── App.tsx               # Main application component
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- MetaMask browser extension
- Hardhat for smart contract development

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/decrico.git
cd decrico

# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Start local blockchain (optional)
npx hardhat node

# Deploy contracts to local network
cd contracts
npx hardhat run scripts/deploy.js --network localhost
cd ..

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
# Contract addresses (set after deployment)
VITE_AID_REQUEST_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_GOVERNANCE_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_REPUTATION_CONTRACT=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Network configuration
VITE_NETWORK_NAME=localhost
VITE_CHAIN_ID=31337
```

## 📋 Smart Contract Deployment

### Local Development Network
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet
```bash
# Set environment variables
export SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
export PRIVATE_KEY="your_private_key"
export ETHERSCAN_API_KEY="your_etherscan_api_key"

# Deploy to Sepolia
cd contracts
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Contract Addresses
- **Local Network**: See deployment output
- **Sepolia Testnet**: Updated after deployment
- **Mainnet**: TBD

## 🎨 User Roles & Features

### 👥 Donors
- Browse and search aid requests
- Make donations with ETH
- Track donation impact
- Participate in governance voting
- View transaction history

### 🆘 Aid Requesters
- Create detailed aid requests
- Upload supporting documentation
- Receive direct donations
- Provide progress updates
- Withdraw funds when verified

### ✅ Verifiers
- Review and verify aid requests
- Participate in community governance
- Earn reputation for accurate verifications
- Access verification dashboard

### 👑 Administrators
- Manage platform operations
- Monitor all transactions
- Oversee verification process
- Configure platform parameters

## 🔧 Configuration

### Wallet Configuration
- **Supported Wallets**: MetaMask, WalletConnect, Coinbase Wallet
- **Networks**: Ethereum Mainnet, Sepolia Testnet, Localhost
- **Gas Optimization**: Dynamic fee calculation for optimal costs

### Smart Contract Features
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions
- **Upgradeable**: Proxy pattern for future improvements
- **Gas Efficient**: Optimized for minimal transaction costs

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request with detailed description

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Solidity**: Follow OpenZeppelin patterns
- **Testing**: Unit tests for critical functions
- **Documentation**: Clear inline comments and README updates

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Frontend Tests
```bash
npm run test
```

### Coverage Reports
```bash
cd contracts
npx hardhat coverage
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** for secure smart contract libraries
- **Ethereum Foundation** for blockchain infrastructure
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Hardhat** for smart contract development tools

## 📞 Support & Contact

- **GitHub Issues**: [Project Issues](https://github.com/your-username/decrico/issues)
- **Discord**: [Community Server](https://discord.gg/decrico)
- **Email**: support@decrico.org
- **Documentation**: [Full Docs](https://docs.decrico.org)

## 🗺️ Roadmap

### Phase 1 (Current) - MVP ✅
- [x] Smart contract development
- [x] Basic request creation and donation functionality
- [x] Wallet integration and transaction handling
- [x] Community verification system
- [x] Responsive web interface

### Phase 2 - Enhanced Features 🚧
- [ ] Mobile app for iOS and Android
- [ ] Advanced analytics dashboard
- [ ] Integration with Chainlink price feeds
- [ ] ENS domain integration
- [ ] Multi-language support

### Phase 3 - Ecosystem Expansion 📋
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] DAO governance implementation
- [ ] NFT badges for contributors
- [ ] Integration with existing relief organizations
- [ ] API for third-party integrations

---

**Built with ❤️ for transparent disaster relief • Ethereum Hackathon 2025**