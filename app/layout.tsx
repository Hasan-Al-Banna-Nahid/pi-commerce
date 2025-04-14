import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./providers/shopping-cart";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pi-Commerce - Digital Devices & Automobiles Solutions",
  description:
    "Your one-stop shop for Digital Devices & Automobiles & equipments and supplies",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
