"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

export default function WalletButton() {
  const { wallet, publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const shortAddress = useMemo(() => {
    if (!base58) return "";
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
  }, [base58]);

  if (!wallet) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="w-full px-6 py-3 rounded-lg font-manrope font-medium transition-all flex items-center justify-center"
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'rgba(255, 255, 255, 0.9)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Connect Wallet
      </button>
    );
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="w-full px-6 py-3 rounded-lg font-manrope font-medium transition-all flex items-center justify-center"
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'rgba(255, 255, 255, 0.9)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="w-full transparent-container hover:bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-3 shadow-sm transition-all group flex items-center justify-center gap-3"
      title="Click to disconnect"
    >
      {wallet.adapter.icon ? (
        <img
          src={wallet.adapter.icon}
          alt={wallet.adapter.name}
          width={20}
          height={20}
          className="rounded w-5 h-5"
        />
      ) : (
        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full"></div>
      )}
      <span className="text-sm font-manrope font-semibold text-white group-hover:text-pink-400">
        {shortAddress}
      </span>
    </button>
  );
}

