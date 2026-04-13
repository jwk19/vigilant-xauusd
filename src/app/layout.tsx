import type { Metadata } from "next";
import "./globals.css";
import BrokerAdLayout from "@/components/banner/BrokerAdLayout";

export const metadata: Metadata = {
  title: "Gold Trader Dashboard | XAU/USD",
  description: "Personal XAU/USD trading companion — sessions, news, risk calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrokerAdLayout>
          {children}
        </BrokerAdLayout>
      </body>
    </html>
  );
}
