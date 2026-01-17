"use client";

import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  Github,
  Home,
  LogOut,
  Menu,
  Scroll,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useSuiBalance } from "@/hooks/use-sui-balance";
import { CopyButton } from "../ui/copy-button";
import { Button } from "../ui/button";
import LoginComponent from "./login";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const menuItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "rooms", label: "Rooms", icon: Gamepad2, href: "/rooms" },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    href: "/leader-board",
  },
  {
    id: "how-to-play",
    label: "How to Play",
    icon: BookOpen,
    href: "/how-to-play",
  },
  { id: "gacha", label: "Gacha", icon: Sparkles, href: "/gacha" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const { balance } = useSuiBalance(currentAccount?.address ?? "");
  const { mutate: disconnect } = useDisconnectWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo/main.png"
              alt="Logo"
              width={40}
              height={40}
              className="shrink-0"
            />
            <span className="text-lg font-bold text-white hidden sm:block">
              Relic of Lies
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Wallet + GitHub */}
          <div className="flex items-center gap-3">
            {/* Wallet Dropdown */}
            {currentAccount ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-zinc-300 font-mono">
                        {currentAccount.address.slice(0, 6)}...
                        {currentAccount.address.slice(-4)}
                      </span>
                      {balance !== null && (
                        <span className="text-xs text-zinc-500">
                          {balance} SUI
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Wallet</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-mono">
                          {currentAccount.address.slice(0, 10)}...
                          {currentAccount.address.slice(-6)}
                        </p>
                        <CopyButton value={currentAccount.address} />
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/gacha" className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Gacha</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:block">
                <LoginComponent />
              </div>
            )}

            {/* GitHub */}
            <a
              href="https://github.com/UyLeQuoc/relic-of-lies-on-sui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Wallet */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              {currentAccount ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shrink-0">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-zinc-300 font-mono">
                          {currentAccount.address.slice(0, 6)}...
                          {currentAccount.address.slice(-4)}
                        </span>
                        <CopyButton value={currentAccount.address} />
                      </div>
                      {balance !== null && (
                        <span className="text-xs text-zinc-500">
                          {balance} SUI
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10"
                    onClick={() => disconnect()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <LoginComponent />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
