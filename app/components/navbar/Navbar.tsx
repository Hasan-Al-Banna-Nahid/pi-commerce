"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, Search, X, User } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import Image from "next/image";
import { useCart } from "@/app/providers/shopping-cart";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, role, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  // Gradient color effect
  const navbarGradient =
    "bg-gradient-to-r from-purple-800 via-blue-800 to-red-800";

  return (
    <nav className={`${navbarGradient} shadow-sm sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2 hover:bg-yellow-400/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="text-white" />
              ) : (
                <Menu className="text-white" />
              )}
            </Button>
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/logo.png"
                width={60}
                height={60}
                alt="logo"
                quality={100}
              />
            </Link>
          </div>

          {/* Middle Section - Search */}
          <div className="hidden md:flex flex-1 mx-6 max-w-xl">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-4 pr-10 text-white py-2 w-full rounded-full border-none focus-visible:ring-2 focus-visible:ring-yellow-700"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full rounded-l-none rounded-r-full bg-yellow-500 hover:bg-yellow-600 text-gray-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 hover:bg-yellow-400/20"
                >
                  <Avatar className="h-8 w-8 border border-yellow-300">
                    {user?.avatar ? (
                      <AvatarImage
                        src={String(user.avatar)}
                        alt={String(user.name)}
                      />
                    ) : null}
                    <AvatarFallback className="bg-yellow-100 text-yellow-800">
                      {user ? (
                        user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-white">
                    {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign In"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium border-b">
                      <div className="truncate">{user.email}</div>
                      {role && (
                        <div className="text-xs text-muted-foreground">
                          {role.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Your Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/order">Your Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">Your Wishlist</Link>
                    </DropdownMenuItem>
                    {role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products">Manage Products</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Create Account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-yellow-400/20"
              asChild
            >
              <Link href="/checkout">
                <ShoppingCart className="h-5 w-5 text-white" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white">
                  {cartCount}
                </Badge>
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden my-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-4 pr-10 py-2 w-full rounded-full border-none focus-visible:ring-2 focus-visible:ring-yellow-700"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none rounded-r-full bg-yellow-500 hover:bg-yellow-600 text-gray-800"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="pt-2 space-y-1">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-blue-500/50"
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/products"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-blue-500/50"
                }`}
              >
                Products
              </Link>
              <Link
                href="/deals"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/deals"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-blue-500/50"
                }`}
              >
                Today's Deals
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/dashboard"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-blue-500/50"
                    }`}
                  >
                    Your Account
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/login"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-blue-500/50"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/register"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-blue-500/50"
                    }`}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Row - Categories */}
        <div className="hidden md:flex items-center space-x-6 py-2">
          {[
            { name: "All Products", path: "/products" },
            { name: "Today's Deals", path: "/deals" },
            { name: "Laptops", path: "/categories/electronics" },
            { name: "Mobiles", path: "/categories/fashion" },
            { name: "Accessories", path: "/categories/home" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium text-white hover:text-yellow-100 ${
                pathname === item.path ? "font-bold underline" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
