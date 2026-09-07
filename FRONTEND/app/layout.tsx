import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veristate — Check before you trust",
  description:
    "Analyze suspicious links, messages, and QR codes for fraud risk indicators before you act.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
