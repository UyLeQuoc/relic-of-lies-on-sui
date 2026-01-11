"use client"

export default function HeroSection() {
  return (
    <section className="relative w-full h-96 md:h-screen overflow-hidden bg-gradient-to-b from-foreground to-foreground">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(147,51,234,0))]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('/images/backgrounds/dark-dungeon-bg.gif')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-6 z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
            <span className="text-white">Descend into the</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Abyss
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the depths of darkness. Survive the unknown horrors that await below.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-foreground to-transparent" />
    </section>
  )
}
