import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BusinessOS Bangladesh",
  description: "Multi-vertical SaaS platform for Bangladesh SMEs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
