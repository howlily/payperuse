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
        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        Connect Wallet
      </button>
    );
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="bg-gray-800 hover:bg-gray-800/80 border border-teal-900/50 rounded-lg px-4 py-3 shadow-sm transition-colors w-full group"
      title="Click to disconnect"
    >
      <div className="flex items-center gap-3">
        {wallet.adapter.icon ? (
          <img
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            width={24}
            height={24}
            className="rounded w-6 h-6"
          />
        ) : (
          <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded"></div>
        )}
        <span className="text-sm font-mono font-semibold text-white group-hover:text-teal-400">
          {shortAddress}
        </span>
      </div>
    </button>
  );
}

