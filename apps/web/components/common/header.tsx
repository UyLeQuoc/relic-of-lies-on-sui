"use client";

import {
  BookOpen,
  Gamepad2,
  Github,
  Home,
  Menu,
  Newspaper,
  Scroll,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiBalance } from "@/hooks/use-sui-balance";
import { CopyButton } from "../ui/copy-button";
import { Button } from "../ui/button";
import LoginComponent from "./login";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  { id: "friends", label: "Friends", icon: Users, href: "/friends" },
  { id: "quests", label: "Quests", icon: Scroll, href: "/quests" },
  { id: "news", label: "News", icon: Newspaper, href: "/news" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const { balance } = useSuiBalance(currentAccount?.address ?? "");

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
            {/* Wallet */}
            {currentAccount ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-zinc-300 font-mono">
                      {currentAccount.address.slice(0, 6)}...
                      {currentAccount.address.slice(-4)}
                    </span>
                    <CopyButton value={currentAccount.address} />
                  </div>
                  {balance && (
                    <span className="text-xs text-zinc-500">{balance} SUI</span>
                  )}
                </div>
              </div>
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
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shrink-0">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-zinc-300 font-mono">
                        {currentAccount.address.slice(0, 6)}...
                        {currentAccount.address.slice(-4)}
                      </span>
                      <CopyButton value={currentAccount.address} />
                    </div>
                    {balance && (
                      <span className="text-xs text-zinc-500">
                        {balance} SUI
                      </span>
                    )}
                  </div>
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
