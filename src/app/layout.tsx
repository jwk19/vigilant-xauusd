import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold Trader Dashboard | XAU/USD",
  description: "Personal XAU/USD trading companion — sessions, news, risk calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
