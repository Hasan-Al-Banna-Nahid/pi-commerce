import type { Metadata } from "next";
import { DashboardNav } from "@/app/components/navbar/dashboard-nav";
import { AuthProvider } from "../providers/auth-provider";

export const metadata: Metadata = {
  title: "Pi-Commerce Dashboard",
  description: "Manage your Pi-Commerce account",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      <AuthProvider>
        <DashboardNav />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </AuthProvider>
    </div>
  );
}
