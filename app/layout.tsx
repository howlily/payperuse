import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import BreathingLights from "./components/BreathingLights";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PayPerUse - AI Partner Powered by x402",
  description: "AI-powered Solana blockchain assistant with wallet integration",
  icons: {
    icon: "/integrations/payperuse.png",
    shortcut: "/integrations/payperuse.png",
    apple: "/integrations/payperuse.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`} style={{ fontFamily: 'var(--font-manrope)' }}>
        <BreathingLights />
        {children}
      </body>
    </html>
  );
}

