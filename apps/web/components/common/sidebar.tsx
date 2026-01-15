"use client"

import {
    BookOpen,
    Gamepad2,
    Github,
    Home,
    Newspaper,
    Scroll,
    Triangle,
    Users
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "rooms", label: "Rooms", icon: Gamepad2 },
  { id: "how-to-play", label: "How to Play", icon: BookOpen },
  { id: "friends", label: "Friends", icon: Users },
  { id: "quests", label: "Quests", icon: Scroll },
  { id: "news", label: "News", icon: Newspaper },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

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
          <div className="p-4 border-b border-zinc-800 flex items-center justify-start bg-black/50">
              <img src="/images/logo/main.png" alt="Logo" width={40} height={40} />
              {isExpanded && <span className="text-sm font-medium whitespace-nowrap text-white">Relic of Lies</span>}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-hidden px-3 py-4 space-y-2 bg-black/50">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hrefMap: Record<string, string> = {
                'home': '/',
                'rooms': '/rooms',
                'how-to-play': '/how-to-play',
                'friends': '/friends',
                'quests': '/quests',
                'news': '/news',
              }
              const href = hrefMap[item.id] || `#${item.id}`
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`flex items-center gap-4 px-3 py-3 rounded-md group justify-start hover:bg-zinc-900/50 transition-all`}
                  style={{
                    transition:
                      "background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), justify-content 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-zinc-400 group-hover:text-white transition-colors duration-200" />
                  {isExpanded && <span className="text-sm font-medium whitespace-nowrap text-zinc-300 group-hover:text-white">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Pre-Register Button */}
          <div className="p-3 border-t border-zinc-800 bg-black/50">
            <Button
            size="lg"
              className={`w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-md hover:from-blue-500 hover:to-cyan-500 flex items-center gap-2 ${
                isExpanded ? "px-4 py-3 justify-center" : "p-3 justify-center"
              }`}
              style={{
                transition:
                  "background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), padding 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onClick={() => {
                router.push('/rooms')
              }}
            >
              <Triangle className="w-4 h-4" />
              {isExpanded && <span className="whitespace-nowrap">Play now</span>}
            </Button>
          </div>

          {/* Social Links */}
          <div
            className={`p-3 border-t border-zinc-800 flex gap-2 bg-black/50 ${isExpanded ? "justify-center" : "justify-center flex-wrap"}`}
          >
              {/* github */}
            <a href="https://github.com/UyLeQuoc/relic-of-lies-on-sui" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors duration-200">
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
            const Icon = item.icon
            const hrefMap: Record<string, string> = {
              'home': '/',
              'rooms': '/rooms',
              'how-to-play': '/how-to-play',
              'friends': '/friends',
              'quests': '/quests',
              'news': '/news',
            }
            const href = hrefMap[item.id] || `#${item.id}`
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
            )
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
  )
}
