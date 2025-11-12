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
  title: "Spectral - Solana AI Assistant",
  description: "AI-powered Solana blockchain assistant with wallet integration",
  icons: {
    icon: "/integrations/spectral logo.png",
    shortcut: "/integrations/spectral logo.png",
    apple: "/integrations/spectral logo.png",
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

