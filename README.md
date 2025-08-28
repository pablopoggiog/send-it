# USDC Token Transfer App

A modern React application for sending USDC tokens on the Avalanche Fuji C-Chain testnet. Built with TypeScript, Wagmi, and Viem for seamless Web3 integration.

## 🎯 Assignment Requirements

This app implements all the core requirements from the rubric:

### ✅ Product Requirements
- **Wallet Connection**: Connect/disconnect Web3 wallets (MetaMask, Core, etc.)
- **Balance Display**: Real-time USDC and AVAX balance on Fuji testnet
- **Token Transfer**: Send USDC with comprehensive validation
- **Transaction Tracking**: Real-time status updates with explorer links
- **Max Button**: Quick amount selection with percentage buttons (25%, 50%, Max)

### ✅ Technical Requirements
- **React + TypeScript**: Modern frontend development
- **Wagmi + Viem**: Web3 integration with Avalanche Fuji
- **Form Validation**: Address format, balance checks, self-transfer prevention
- **Error Handling**: Comprehensive error states and user feedback
- **Responsive Design**: Mobile-first, accessible UI
- **Unit Testing**: Comprehensive test coverage

## 🏗️ Technical Approach

### Architecture
- **Component-based**: Modular React components with clear separation of concerns
- **Hook-based**: Custom hooks for wallet connection, balance fetching, and form validation
- **Type-safe**: Full TypeScript implementation with proper type definitions
- **Accessible**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation

### Key Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with proper interfaces
- **Wagmi**: React hooks for Ethereum (and Avalanche) interactions
- **Viem**: Low-level Ethereum client for blockchain interactions
- **Vitest**: Fast unit testing with React Testing Library
- **Vite**: Modern build tool for fast development and optimized production builds

### Web3 Integration
- **Chain**: Avalanche Fuji testnet (Chain ID: 43113)
- **Token**: USDC contract at `0x5425890298aed601595a70AB815c96711a31Bc65`
- **Wallet Support**: Any injected wallet (MetaMask, Core, etc.)
- **RPC**: Public Avalanche testnet endpoint

## 🚀 Quick Start

### Prerequisites
- Node.js >= 22.14.0
- pnpm >= 10.5.2
- Web3 wallet (MetaMask, Core, etc.)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:5173
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Building
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🧪 Testing Documentation

### Test Structure
```
src/
├── components/
│   ├── SendTokens.test.tsx    # Main form component tests
│   └── AccountSelector.test.tsx # Wallet connection tests
└── lib/
    ├── address.test.ts        # Address utility tests
    └── usdc.test.ts          # USDC contract tests
```

### Test Coverage
- **Component Tests**: Rendering, user interactions, form validation
- **Utility Tests**: Address formatting, USDC parsing/formatting
- **Integration Tests**: Wallet connection, balance fetching
- **Error Handling**: Invalid inputs, network errors, user rejections

### Running Specific Tests
```bash
# Run only component tests
pnpm test components/

# Run only utility tests
pnpm test lib/

# Run tests matching a pattern
pnpm test -- -t "SendTokens"
```

## 🔧 Configuration

### Network Settings
```typescript
// src/lib/wagmiConfig.ts
export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [injected()],
  transports: {
    [avalancheFuji.id]: http()
  }
});
```

### USDC Contract
```typescript
// src/lib/usdc.ts
export const USDC_TOKEN_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
export const USDC_DECIMALS = 6;
```

## 🎨 Features

### Core Functionality
- **Wallet Connection**: Seamless Web3 wallet integration
- **Balance Display**: Real-time USDC and AVAX balances
- **Smart Validation**: Address format, balance checks, self-transfer prevention
- **Transaction Flow**: Complete send flow with status tracking
- **Error Handling**: User-friendly error messages and recovery

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Clear feedback during async operations
- **Accessibility**: Screen reader support, keyboard navigation
- **Modern UI**: Clean, dark-themed interface

### Developer Experience
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive unit test coverage
- **Code Quality**: ESLint, Prettier, and Biome for code formatting
- **Documentation**: Clear code comments and JSDoc

## 🔒 Security Features

- **Address Validation**: Viem's `isAddress` for format validation
- **Balance Checks**: Prevents insufficient balance transactions
- **Self-Transfer Prevention**: Blocks sending to own address
- **Input Sanitization**: Prevents invalid numeric inputs
- **Error Boundaries**: Graceful error handling

## 📱 Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This app is configured for Avalanche Fuji testnet. For mainnet deployment, update the chain configuration and contract addresses accordingly.
