# x402app - Next.js Application

A modern, production-ready Next.js application built with React 18, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Next.js 14** - Latest version with App Router
- ⚛️ **React 18** - Modern React features
- 🔷 **TypeScript** - Full type safety
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🌙 **Dark Mode** - Built-in dark mode support
- 📱 **Responsive** - Mobile-first design
- 🚀 **Fast** - Optimized for performance
- 💼 **Solana Wallet Integration** - Connect with Phantom, Solflare, and more
- 🎨 **Montserrat Font** - Clean, modern typography
- ✨ **Animated Background** - Interactive particle effects

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, or pnpm package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Pages

- **Home**: [http://localhost:3000](http://localhost:3000) - Landing page
- **Spectral**: [http://localhost:3000/spectral](http://localhost:3000/spectral) - Solana blockchain AI assistant

### Building for Production

To create a production build:

```bash
npm run build
npm run start
```

## Project Structure

```
x402app/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## Customization

### Styling

This project uses Tailwind CSS. You can customize the design system by editing:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles and CSS variables

### Pages

- Edit `app/page.tsx` to modify the home page
- **Spectral Agent** (`/spectral`) - Solana blockchain AI assistant with wallet integration
- Create new pages by adding files to the `app/` directory
- Learn more about [App Router](https://nextjs.org/docs/app)

### Solana Wallet Connection

The Spectral Agent page includes integrated Solana wallet functionality:

- **Supported Wallets**: Phantom, Solflare, Torus, Ledger
- **Network**: Currently configured for Solana Devnet
- **Auto-Connect**: Automatically reconnects to previously connected wallets
- To change network, edit `app/spectral/components/WalletProvider.tsx`

To use wallet features:
1. Navigate to `/spectral`
2. Click "Connect Wallet" button
3. Select your preferred wallet from the modal
4. Approve the connection in your wallet extension

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT

