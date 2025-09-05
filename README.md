# BitSave Pool

A decentralized savings pool application built as a Farcaster Mini App. BitSave Pool allows users to create and participate in collaborative savings plans with smart contract-powered transparency and security.

## 🌟 Features

### For Plan Creators
- **Create Savings Plans**: Set up savings goals with customizable targets and timelines
- **Manage Participants**: Add or remove participants from your savings plans
- **Real-time Monitoring**: Track contributions and progress in real-time
- **Plan Control**: Cancel plans when necessary with proper participant notifications

### For Participants
- **Join Plans**: Participate in savings plans created by others
- **Contribute Funds**: Make contributions towards collective savings goals
- **Track Progress**: Monitor your contributions and overall plan progress
- **ENS Integration**: View participant names and avatars through ENS resolution

### Smart Contract Integration
- **JointSavings Contract**: Fully integrated with smart contracts for transparent fund management
- **On-chain Verification**: All contributions and plan data stored securely on-chain
- **Wallet Integration**: Seamless Web3 wallet connectivity via Wagmi
- **Multi-chain Support**: Built with extensibility for multiple blockchain networks

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Radix UI components
- **Web3**: Wagmi + Viem for smart contract interactions
- **ENS**: Full ENS name and avatar resolution
- **Mini App**: Built for Farcaster ecosystem integration
- **State Management**: TanStack React Query for server state
- **Animation**: Framer Motion for smooth interactions

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask, etc.)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bitsave-pool.git
   cd bitsave-pool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Local: `http://localhost:3001`
   - Preview in Farcaster: Use the Mini App Debug Tool

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run Biome linter

## 📱 Farcaster Integration

### Manifest Configuration

The `/.well-known/farcaster.json` is served from the [public directory](https://vite.dev/guide/assets) and can be updated by editing `./public/.well-known/farcaster.json`.

### Frame Embed

Add the `fc:frame` meta tag in `index.html` to make your app shareable in Farcaster feeds:

```html
<head>
  <!--- other tags --->
  <meta name="fc:frame" content='{"version":"next","imageUrl":"https://placehold.co/900x600.png?text=BitSave%20Pool","button":{"title":"Open App","action":{"type":"launch_frame","name":"BitSave Pool","url":"https://your-domain.com"}}}' /> 
</head>
```

## 🏗️ Architecture

### Smart Contract Components
- **Plan Creation**: Create new savings plans with target amounts and deadlines
- **Participant Management**: Add/remove participants with proper access controls
- **Contribution Tracking**: Record and track all participant contributions
- **Fund Management**: Secure handling of pooled funds with withdrawal mechanisms

### Frontend Components
- **Plan Dashboard**: Overview of all available and active plans
- **Plan Details**: Comprehensive view with Overview and Participants tabs
- **Participant Management**: Modals for adding/removing participants (owner only)
- **Contribution Interface**: Simple and intuitive contribution workflows

## 🔐 Security Features

- **Smart Contract Verification**: All transactions verified on-chain
- **Access Control**: Owner-only functions for plan management
- **Contribution Validation**: Proper validation of contribution amounts
- **ENS Integration**: Secure address resolution and display

## 🌐 Deployment

This project is optimized for deployment on:
- **Vercel** (recommended for Farcaster Mini Apps)
- **Netlify**
- **Any static hosting service**

For Farcaster Mini App deployment, ensure your domain is properly configured in the manifest file.
