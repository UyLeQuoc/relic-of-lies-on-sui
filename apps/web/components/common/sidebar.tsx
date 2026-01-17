"use client";

import {
  BookOpen,
  Gamepad2,
  Github,
  Home,
  Newspaper,
  Scroll,
  Triangle,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiBalance } from "@/hooks/use-sui-balance";

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "rooms", label: "Rooms", icon: Gamepad2 },
  { id: "how-to-play", label: "How to Play", icon: BookOpen },
  { id: "friends", label: "Friends", icon: Users },
  { id: "quests", label: "Quests", icon: Scroll },
  { id: "news", label: "News", icon: Newspaper },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const currentAccount = useCurrentAccount();
  const { balance, error } = useSuiBalance(currentAccount?.address ?? "");
  console.log(error);
  console.log(balance);
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="relative h-screen hidden md:block"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Sidebar Container */}
        <div
          className={`fixed left-0 top-0 h-screen bg-black/95 border-r border-zinc-800 flex flex-col ${
            isExpanded ? "w-50" : "w-20"
          }`}
          style={{
            transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Logo Section */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-start bg-black/50 overflow-hidden">
            <img
              src="/images/logo/main.png"
              alt="Logo"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <span
              className={`text-sm font-medium whitespace-nowrap text-white transition-all duration-400 ${
                isExpanded
                  ? "opacity-100 ml-2 max-w-40"
                  : "opacity-0 ml-0 max-w-0"
              }`}
            >
              Relic of Lies
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-hidden px-3 py-4 space-y-2 bg-black/50">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hrefMap: Record<string, string> = {
                home: "/",
                rooms: "/rooms",
                "how-to-play": "/how-to-play",
                friends: "/friends",
                quests: "/quests",
                news: "/news",
              };
              const href = hrefMap[item.id] || `#${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="flex items-center px-3 py-3 rounded-md group justify-start hover:bg-zinc-900/50 transition-colors duration-200 overflow-hidden"
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-zinc-400 group-hover:text-white transition-colors duration-200" />
                  <span
                    className={`text-sm font-medium whitespace-nowrap text-zinc-300 group-hover:text-white transition-all duration-400 ${
                      isExpanded
                        ? "opacity-100 ml-4 max-w-40"
                        : "opacity-0 ml-0 max-w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-3 border-t border-zinc-800 bg-black/50 overflow-hidden">
            {currentAccount ? (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex-shrink-0">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`flex flex-col overflow-hidden transition-all duration-400 ${
                    isExpanded
                      ? "opacity-100 ml-2 max-w-40"
                      : "opacity-0 ml-0 max-w-0"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm text-zinc-300 font-mono whitespace-nowrap">
                      {currentAccount.address.slice(0, 6)}...
                      {currentAccount.address.slice(-4)}
                    </span>
                    <CopyButton
                      value={currentAccount.address}
                      className="ml-1"
                    />
                  </div>
                  {balance && (
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {balance} SUI
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0">
                  <Wallet className="w-4 h-4 text-zinc-500" />
                </div>
                <span
                  className={`text-sm text-zinc-500 whitespace-nowrap transition-all duration-400 ${
                    isExpanded
                      ? "opacity-100 ml-2 max-w-32"
                      : "opacity-0 ml-0 max-w-0"
                  }`}
                >
                  Not connected
                </span>
              </div>
            )}
          </div>

          {/* Pre-Register Button */}
          <div className="p-3 border-t border-zinc-800 bg-black/50">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-md hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center p-3 overflow-hidden"
              onClick={() => {
                router.push("/rooms");
              }}
            >
              <Triangle className="w-4 h-4 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-400 ${
                  isExpanded
                    ? "opacity-100 ml-2 max-w-24"
                    : "opacity-0 ml-0 max-w-0"
                }`}
              >
                Play now
              </span>
            </Button>
          </div>

          {/* Social Links */}
          <div
            className={`p-3 border-t border-zinc-800 flex gap-2 bg-black/50 ${isExpanded ? "justify-center" : "justify-center flex-wrap"}`}
          >
            {/* github */}
            <a
              href="https://github.com/UyLeQuoc/relic-of-lies-on-sui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors duration-200"
            >
              <span className="text-lg">
                <Github className="w-4 h-4" />
              </span>
            </a>
          </div>
        </div>

        {/* Content Area Spacer */}
        <div
          style={{
            marginLeft: isExpanded ? "200px" : "80px",
            transition: "margin-left 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="h-screen"
        >
          {/* Your page content goes here */}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-zinc-800 z-50 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-3">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const hrefMap: Record<string, string> = {
              home: "/",
              rooms: "/rooms",
              "how-to-play": "/how-to-play",
              friends: "/friends",
              quests: "/quests",
              news: "/news",
            };
            const href = hrefMap[item.id] || `#${item.id}`;
            return (
              <Link
                key={item.id}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-md group min-w-0 hover:bg-zinc-900/50 transition-colors"
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-zinc-400 group-hover:text-white transition-colors duration-200" />
                <span className="text-[10px] font-medium text-zinc-400 group-hover:text-white transition-colors duration-200 truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link
            href="/rooms"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-md group min-w-0"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full p-2">
              <Triangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400 group-hover:text-white transition-colors duration-200">
              Play
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Content Spacer */}
      <div className="md:hidden pb-20">
        {/* Your page content goes here - with bottom padding for nav */}
      </div>
    </>
  );
}
