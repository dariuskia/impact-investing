import "~/styles/globals.css";

import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const generalSans = localFont({
  src: "../fonts/GeneralSans.ttf",
  display: "swap",
  variable: "--font-general-sans",
});

export const metadata = {
  title: "Alignly",
  description: "Put your money where your heart is.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${generalSans.className}`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
