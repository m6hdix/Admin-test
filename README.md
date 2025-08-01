# Mehdi Jetton - Complete TON Jetton Management System

A comprehensive TON blockchain jetton (token) management system built with Tact language, featuring advanced fee calculation, admin controls, user permissions, and a complete web interface.

## 🚀 Features

### Smart Contract Features
- **Fee Calculation System**: Dynamic fee calculation based on transfer amount
- **Admin Controls**: Full administrative control over contract parameters
- **Transfer Toggle**: Enable/disable all transfers with admin command
- **User Permissions**: Granular control over individual user permissions
- **Whitelisting**: Exempt specific users from fees
- **Minting**: Admin-only token minting functionality
- **Event Logging**: Comprehensive event system for transparency

### Web Interface Features
- **User Dashboard**: Clean interface for regular users
- **Admin Panel**: Comprehensive admin control interface
- **Real-time Updates**: Live balance and status updates
- **Fee Calculator**: Built-in fee estimation tool
- **Transaction History**: Track all transactions
- **Responsive Design**: Works on desktop and mobile
- **TON Wallet Integration**: Seamless wallet connection

## 📁 Project Structure

```
mehdi-jetton/
├── contracts/
│   ├── MehdiJetton.tact          # Main smart contract
│   ├── deploy.ts                 # Deployment script
│   └── test.tact                 # Legacy test contract
├── ui/
│   ├── index.html               # User dashboard
│   ├── admin.html               # Admin panel
│   └── app.js                   # JavaScript application
├── tests/
│   └── MehdiJetton.spec.ts      # Comprehensive test suite
├── build/                       # Compiled contracts (auto-generated)
├── scripts/                     # Utility scripts
├── package.json
├── tact.config.json
├── jest.config.ts
├── tsconfig.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- TON Wallet (for testing)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mehdi-jetton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the contracts**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   This will start both the UI server and test watcher.

## 🚀 Deployment

### Testnet Deployment
1. **Configure your wallet** in Blueprint
2. **Deploy to testnet**:
   ```bash
   npm run deploy
   ```

### Mainnet Deployment
1. **Update configuration** for mainnet
2. **Deploy to mainnet**:
   ```bash
   npm run deploy:mainnet
   ```

## 🎯 Usage Guide

### For Users
1. **Connect Wallet**: Visit the UI and connect your TON wallet
2. **View Balance**: Check your MEHDI token balance
3. **Transfer Tokens**: Send tokens to other addresses
4. **Calculate Fees**: Use the built-in fee calculator
5. **Track History**: View your transaction history

### For Admins
1. **Access Admin Panel**: Navigate to admin.html
2. **Connect Admin Wallet**: Use the admin wallet
3. **Manage Contract**:
   - **Mint Tokens**: Create new tokens
   - **Toggle Transfers**: Enable/disable all transfers
   - **Set Fee Rate**: Adjust transaction fees (0-10%)
   - **Manage Users**: Set individual user permissions
   - **Update Collector**: Change fee collection address

## 📋 Smart Contract Functions

### Admin Functions
- `ChangeAdmin(newAdmin: Address)` - Change contract admin
- `ToggleTransfers(enabled: Bool)` - Enable/disable transfers
- `SetFee(feePercentage: Int)` - Set global fee (0-10%)
- `SetFeeCollector(newCollector: Address)` - Change fee collector
- `SetUserPermissions(user: Address, canTransfer: Bool, isWhitelisted: Bool, customFee: Int)` - Set user permissions
- `Mint(to: Address, amount: Int, responseAddress: Address)` - Mint new tokens

### User Functions
- `getBalance(user: Address)` - Get user balance
- `getJettonData()` - Get contract information
- `getUserPermissions(user: Address)` - Get user permissions

### Internal Functions
- `calculateFee(amount: Int, user: Address)` - Calculate transaction fee
- `internalTransfer(from: Address, to: Address, amount: Int)` - Internal transfer logic

## 🔧 Configuration

### Contract Configuration
The contract is configured through:
- **Admin Address**: Set during deployment
- **Initial Fee**: 2% (configurable)
- **Fee Collector**: Initially set to admin address
- **Transfer Status**: Enabled by default

### UI Configuration
Update the following in `ui/app.js`:
- `contractAddress`: Set after deployment
- Wallet connection settings
- Network configuration (testnet/mainnet)

## 🧪 Testing

### Test Coverage
- ✅ Contract deployment
- ✅ Fee calculation accuracy
- ✅ Admin permission checks
- ✅ Transfer functionality
- ✅ User permission system
- ✅ Whitelist functionality
- ✅ Edge cases and error handling

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test MehdiJetton.spec.ts
```

## 📊 Fee System

### Fee Calculation
- **Default Fee**: 2% of transfer amount
- **Range**: 0-10% (configurable by admin)
- **Whitelisted Users**: 0% fee
- **Custom User Fees**: Override global fee

### Example Fee Calculations
| Transfer Amount | Fee Rate | Fee Amount | Net Amount |
|-----------------|----------|------------|------------|
| 100 MEHDI       | 2%       | 2 MEHDI    | 98 MEHDI   |
| 1000 MEHDI      | 5%       | 50 MEHDI   | 950 MEHDI  |
| 100 MEHDI       | 0%       | 0 MEHDI    | 100 MEHDI  |

## 🔐 Security Features

### Access Control
- **Admin-only functions**: Protected by address checks
- **Permission system**: Granular user controls
- **Fee limits**: Maximum 10% fee cap
- **Input validation**: All inputs validated

### Best Practices
- Use separate admin wallet
- Test thoroughly on testnet
- Monitor contract events
- Keep private keys secure

## 🌐 Web Interface

### User Dashboard (`index.html`)
- **Wallet Connection**: TON wallet integration
- **Balance Display**: Real-time balance updates
- **Transfer Form**: Easy token transfers
- **Fee Calculator**: Transfer fee estimation
- **Transaction History**: Recent transactions

### Admin Panel (`admin.html`)
- **Contract Overview**: Key metrics display
- **Mint Tokens**: Create new tokens
- **Fee Management**: Adjust fee rates
- **User Permissions**: Manage individual users
- **Action Logging**: Track admin actions
- **Transaction Monitor**: Real-time transaction tracking

## 📱 Mobile Support

The web interface is fully responsive and works on:
- iOS Safari
- Android Chrome
- Mobile TON wallets
- Desktop browsers

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Join our [Telegram group](https://t.me/your-group)
- Email: support@mehdijetton.com

## 🔗 Useful Links

- [TON Documentation](https://docs.ton.org/)
- [Tact Language](https://tact-lang.org/)
- [TON Connect](https://docs.tonconnect.io/)
- [Blueprint Framework](https://github.com/ton-org/blueprint)

---

**Built with ❤️ for the TON ecosystem**
