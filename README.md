# USDC Token Transfer App

A modern web application for sending USDC tokens on the Avalanche Fuji C-Chain testnet. Built with React, TypeScript, and Web3 technologies.

## Features

- 🔗 **Wallet Connection**: Connect to MetaMask, Core, or any injected Web3 wallet
- 💰 **Balance Display**: Real-time display of USDC and AVAX balances
- 📝 **Form Validation**: Comprehensive validation for addresses and amounts
- 🎯 **Smart Input**: Percentage buttons (25%, 50%, 75%) and Max button for quick amount selection
- 🔄 **Transaction Tracking**: Real-time transaction status updates
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, dark-themed interface inspired by Core Web's Send tool

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Web3**: Wagmi + Viem
- **Styling**: CSS with modern design system
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Prerequisites

- Node.js >= 22.14.0
- pnpm >= 10.5.2
- A Web3 wallet (MetaMask, Core, etc.)
- Fuji testnet AVAX for gas fees

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-takehome-skeleton-main
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Approve the connection in your wallet
3. Ensure your wallet is connected to Avalanche Fuji testnet

### Getting Test Tokens

- **AVAX**: Get test AVAX from the [Fuji Faucet](https://faucet.avax.network/)
- **USDC**: The app uses the official USDC contract on Fuji testnet

### Sending USDC

1. **Enter Recipient Address**: Paste a valid Avalanche C-Chain address
2. **Set Amount**: 
   - Type the amount manually, or
   - Use percentage buttons (25%, 50%, 75%), or
   - Click "Max" to send your entire balance
3. **Review**: Check the recipient address and amount
4. **Send**: Click the "Send" button and confirm in your wallet

### Transaction Status

- **Confirming**: Transaction is being processed by your wallet
- **Processing**: Transaction is being mined on the blockchain
- **Success**: Transaction completed with explorer link

## Testing

Run the test suite:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test --watch
```

### Test Coverage

The application includes comprehensive unit tests covering:

- Component rendering
- Form validation
- User interactions
- Wallet connection
- Transaction flow

## Project Structure

```
src/
├── components/
│   ├── Connect.tsx          # Wallet connection component
│   ├── SendTokens.tsx       # Main token transfer form
│   └── *.test.tsx          # Component tests
├── lib/
│   ├── address.ts          # Address utility functions
│   ├── usdc.ts            # USDC contract configuration
│   └── wagmiConfig.ts     # Wagmi configuration
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Configuration

### Network Configuration

The app is configured for Avalanche Fuji testnet:

- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **USDC Contract**: `0x5425890298aed601595a70AB815c96711a31Bc65`

### Environment Variables

No environment variables are required for basic functionality. The app uses public RPC endpoints.

## Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

## Security Considerations

- ✅ Address validation using Viem's `isAddress`
- ✅ Balance checks before transaction submission
- ✅ Self-transfer prevention
- ✅ Input sanitization
- ✅ Error handling for failed transactions

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **"Invalid Avalanche (C-Chain) address format"**
   - Ensure the address starts with `0x` and is 42 characters long
   - Check for typos in the address

2. **"Insufficient balance"**
   - Verify you have enough USDC tokens
   - Ensure you have AVAX for gas fees

3. **"Transaction failed"**
   - Check your internet connection
   - Ensure your wallet is connected to Fuji testnet
   - Verify you have sufficient gas fees

4. **Wallet not connecting**
   - Ensure you have a Web3 wallet installed
   - Try refreshing the page
   - Check wallet permissions

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your wallet is connected to the correct network
3. Ensure you have sufficient test tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Core Web's Send tool UI
- Built with modern Web3 standards
- Uses Avalanche Fuji testnet for development
