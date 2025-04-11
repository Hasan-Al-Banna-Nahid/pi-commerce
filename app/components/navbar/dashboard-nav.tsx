"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export function DashboardNav() {
  const { user, isAuthenticated, logout, role, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || !isAuthenticated) return null;

  const navLinks = [
    {
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      label: "Dashboard",
      allowedRoles: ["admin", "vendor", "retailer", "wholesaler", "customer"],
    },
    {
      href: "/dashboard/products",
      icon: <Package className="h-4 w-4" />,
      label: "Products",
      allowedRoles: ["admin", "vendor", "retailer", "wholesaler", "customer"],
    },
    {
      href: "/dashboard/orders",
      icon: <ShoppingCart className="h-4 w-4" />,
      label: "Orders",
      allowedRoles: ["admin", "vendor", "retailer", "wholesaler", "customer"],
    },
    {
      href: "/dashboard/admin/users",
      icon: <Users className="h-4 w-4" />,
      label: "Users",
      allowedRoles: ["admin"],
    },
    {
      href: "/dashboard/admin/reports",
      icon: <LineChart className="h-4 w-4" />,
      label: "Reports",
      allowedRoles: ["admin"],
    },
  ];

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">Pi-Commerce</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks
              .filter((link) => link.allowedRoles.includes(role || ""))
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    pathname === link.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
