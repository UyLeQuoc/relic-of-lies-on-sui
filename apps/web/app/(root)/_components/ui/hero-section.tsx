"use client"

import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[600px] md:h-[85vh] overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.2),rgba(59,130,246,0))]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('/images/backgrounds/dark-dungeon-bg.gif')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b opacity-10 from-transparent via-black/35 to-black" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-balance leading-tight">
              <span className="text-white">Relic of</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Lies
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Master the art of deception in Love Letter 2019 Premium Edition. 
              Play on-chain, stake SUI, and compete for the ultimate prize.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-base px-8 py-6 min-w-[200px] group border-0"
            >
              <Link href="/rooms" className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Play Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-zinc-700 text-white hover:bg-zinc-900 hover:border-zinc-600 text-base px-8 py-6 min-w-[200px]"
            >
              <Link href="/how-to-play">
                Learn How to Play
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live on Sui Blockchain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>21 Cards, 10 Types</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Winner Takes All</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  )
}
