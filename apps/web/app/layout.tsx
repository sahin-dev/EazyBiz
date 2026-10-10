import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/feedback";
import "./globals.css";
import "./design-system.css";

export const metadata: Metadata = {
  title: "BusinessOS Bangladesh",
  description: "Multi-vertical SaaS platform for Bangladesh SMEs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem("businessos-theme")|| (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){document.documentElement.dataset.theme="light"}` }} />
      </head>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
