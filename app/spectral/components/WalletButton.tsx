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
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        Connect Wallet
      </button>
    );
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 shadow-sm transition-colors w-full group"
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
          <div className="w-6 h-6 bg-purple-500 rounded"></div>
        )}
        <span className="text-sm font-mono font-semibold text-gray-900 group-hover:text-gray-700">
          {shortAddress}
        </span>
      </div>
    </button>
  );
}

