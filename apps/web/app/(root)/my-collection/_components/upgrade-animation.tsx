"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import { CardNames, type CardNFT } from "@/hooks/use-game-contract";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";
import { cn } from "@/lib/utils";

function triggerSuccessConfetti() {
  const end = Date.now() + 1 * 1000; // 1 second
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

interface UpgradeAnimationProps {
  cards: [CardNFT, CardNFT, CardNFT];
  isOpen: boolean;
  onComplete: (success: boolean, newCard: CardNFT | null) => void;
  upgradeResult: {
    success: boolean;
    newCard: CardNFT | null;
  } | null;
}

type AnimationPhase = "idle" | "merging" | "waiting" | "result" | "failed";

export function UpgradeAnimation({
  cards,
  isOpen,
  onComplete,
  upgradeResult,
}: UpgradeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [showResult, setShowResult] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [waitingForResult, setWaitingForResult] = useState(false);

  // Reset state when animation closes
  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setShowResult(false);
      setShowFailure(false);
      setWaitingForResult(false);
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    }
  }, [isOpen]);

  // Handle result animation when upgradeResult arrives
  useEffect(() => {
    if (!waitingForResult || !upgradeResult) return;

    const card1 = card1Ref.current;
    const card2 = card2Ref.current;
    const card3 = card3Ref.current;

    if (!card1 || !card2 || !card3) return;

    setWaitingForResult(false);

    if (upgradeResult.success && upgradeResult.newCard) {
      // Success animation
      setPhase("result");
      setShowResult(true);

      // Trigger confetti
      triggerSuccessConfetti();

      // Hide the merged cards
      gsap.to([card1, card2, card3], {
        scale: 1.2,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Animate result card after a short delay
      setTimeout(() => {
        if (resultCardRef.current) {
          gsap.fromTo(
            resultCardRef.current,
            {
              scale: 0,
              opacity: 0,
              rotation: 360,
            },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              onComplete: () => {
                setTimeout(() => {
                  onComplete(true, upgradeResult.newCard);
                }, 1500);
              },
            }
          );
        }
      }, 100);
    } else {
      // Failure animation
      setPhase("failed");
      setShowFailure(true);

      // Show cards as grey
      gsap.to([card1, card2, card3], {
        filter: "grayscale(100%)",
        duration: 0.3,
      });

      // Shatter and drop animation
      const shatterTl = gsap.timeline({ delay: 0.5 });

      shatterTl
        .to(card1, {
          rotation: -45,
          x: -300,
          y: 600,
          opacity: 0,
          duration: 1.5,
          ease: "power2.in",
        })
        .to(
          card2,
          {
            rotation: 15,
            y: 600,
            opacity: 0,
            duration: 1.5,
            ease: "power2.in",
          },
          "<"
        )
        .to(
          card3,
          {
            rotation: 45,
            x: 300,
            y: 600,
            opacity: 0,
            duration: 1.5,
            ease: "power2.in",
          },
          "<"
        )
        .call(() => {
          setTimeout(() => {
            onComplete(false, upgradeResult?.newCard ?? null);
          }, 500);
        });
    }
  }, [waitingForResult, upgradeResult, onComplete]);

  // Start animation when opened
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const card1 = card1Ref.current;
    const card2 = card2Ref.current;
    const card3 = card3Ref.current;

    if (!card1 || !card2 || !card3) return;

    // Reset state
    setShowResult(false);
    setShowFailure(false);

    // Reset card positions and styles
    gsap.set([card1, card2, card3], {
      opacity: 1,
      scale: 1,
      rotation: 0,
      filter: "grayscale(0%)",
      y: 0,
    });
    gsap.set(card1, { x: -200 });
    gsap.set(card2, { x: 0 });
    gsap.set(card3, { x: 200 });

    setPhase("merging");

    // Main animation timeline
    const mainTl = gsap.timeline();
    timelineRef.current = mainTl;

    mainTl.to(card1, {
      x: 0,
      rotation: -8,
      duration: 1,
      ease: "power2.inOut",
    }, "merge");

    mainTl.to(card3, {
      x: 0,
      rotation: 8,
      duration: 1,
      ease: "power2.inOut",
    }, "merge");

    // Compress cards
    mainTl.to([card1, card2, card3], {
      scale: 0.85,
      duration: 0.4,
      ease: "power2.in",
    });

    // Pulse effect while waiting
    mainTl.to([card1, card2, card3], {
      scale: 0.9,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Set waiting state
    mainTl.call(() => {
      setPhase("waiting");
      setWaitingForResult(true);
    });

    return () => {
      mainTl.kill();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full animate-pulse",
              i % 3 === 0 ? "bg-amber-500/40" : i % 3 === 1 ? "bg-orange-500/30" : "bg-yellow-500/30"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Magic circle effect during merging */}
      {(phase === "merging" || phase === "waiting") && (
        <div className="absolute w-80 h-80 border-2 border-amber-500/30 rounded-full animate-spin" style={{ animationDuration: "8s" }}>
          <div className="absolute inset-4 border border-orange-500/20 rounded-full animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
          <div className="absolute inset-8 border border-yellow-500/20 rounded-full animate-spin" style={{ animationDuration: "4s" }} />
        </div>
      )}

      {/* Status text */}
      <div className="absolute top-20 left-0 right-0 text-center">
        <h2 className="text-3xl font-bold font-god-of-war tracking-wider text-amber-500 animate-pulse">
          {phase === "merging" && "Combining..."}
          {phase === "waiting" && "Awaiting Fate..."}
          {phase === "result" && "SUCCESS!"}
          {phase === "failed" && "FAILED!"}
        </h2>
        {phase === "waiting" && (
          <p className="text-sm text-muted-foreground mt-2">Processing transaction...</p>
        )}
      </div>

      {/* Cards container */}
      <div className="relative w-full h-96 flex items-center justify-center">
        {/* Card 1 */}
        <div
          ref={card1Ref}
          className="absolute w-32 h-44 rounded-lg overflow-hidden will-change-transform"
          style={{
            backgroundColor: "#1a1a2e",
            border: `2px solid ${RarityColors[cards[0].rarity]}`,
            boxShadow: RarityGlow[cards[0].rarity],
            transform: "translateX(-200px)",
          }}
        >
          <img
            src={`/images/cards/characters/${cards[0].value}.png`}
            alt={CardNames[cards[0].value]}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <p
              className="text-xs font-bold text-center"
              style={{ color: RarityColors[cards[0].rarity] }}
            >
              {RarityNames[cards[0].rarity]}
            </p>
            <p className="text-[10px] text-center text-white/70">
              {CardNames[cards[0].value]}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          ref={card2Ref}
          className="absolute w-32 h-44 rounded-lg overflow-hidden will-change-transform"
          style={{
            backgroundColor: "#1a1a2e",
            border: `2px solid ${RarityColors[cards[1].rarity]}`,
            boxShadow: RarityGlow[cards[1].rarity],
          }}
        >
          <img
            src={`/images/cards/characters/${cards[1].value}.png`}
            alt={CardNames[cards[1].value]}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <p
              className="text-xs font-bold text-center"
              style={{ color: RarityColors[cards[1].rarity] }}
            >
              {RarityNames[cards[1].rarity]}
            </p>
            <p className="text-[10px] text-center text-white/70">
              {CardNames[cards[1].value]}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          ref={card3Ref}
          className="absolute w-32 h-44 rounded-lg overflow-hidden will-change-transform"
          style={{
            backgroundColor: "#1a1a2e",
            border: `2px solid ${RarityColors[cards[2].rarity]}`,
            boxShadow: RarityGlow[cards[2].rarity],
            transform: "translateX(200px)",
          }}
        >
          <img
            src={`/images/cards/characters/${cards[2].value}.png`}
            alt={CardNames[cards[2].value]}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <p
              className="text-xs font-bold text-center"
              style={{ color: RarityColors[cards[2].rarity] }}
            >
              {RarityNames[cards[2].rarity]}
            </p>
            <p className="text-[10px] text-center text-white/70">
              {CardNames[cards[2].value]}
            </p>
          </div>
        </div>

        {/* Result card */}
        {showResult && upgradeResult?.newCard && (
          <div
            ref={resultCardRef}
            className="absolute w-48 h-64 rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#1a1a2e",
              border: `3px solid ${RarityColors[upgradeResult.newCard.rarity]}`,
              boxShadow: `${RarityGlow[upgradeResult.newCard.rarity]}, 0 0 80px ${RarityColors[upgradeResult.newCard.rarity]}60`,
              opacity: 0,
            }}
          >
            <img
              src={`/images/cards/characters/${upgradeResult.newCard.value}.png`}
              alt={CardNames[upgradeResult.newCard.value]}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p
                className="text-base font-bold text-center"
                style={{ color: RarityColors[upgradeResult.newCard.rarity] }}
              >
                {RarityNames[upgradeResult.newCard.rarity]}
              </p>
              <p className="text-sm text-center text-white/80">
                {CardNames[upgradeResult.newCard.value]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Result message */}
      {phase === "result" && upgradeResult?.newCard && (
        <div className="absolute bottom-24 left-0 right-0 text-center animate-bounce">
          <p className="text-xl font-bold text-emerald-400">
            Upgraded to{" "}
            <span
              className="font-god-of-war"
              style={{ color: RarityColors[upgradeResult.newCard.rarity] }}
            >
              {RarityNames[upgradeResult.newCard.rarity]}
            </span>
            !
          </p>
        </div>
      )}

      {phase === "failed" && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-xl font-bold text-red-400">
            Upgrade Failed!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The cards shattered during the process...
          </p>
          {upgradeResult?.newCard && (
            <p className="text-sm text-amber-400 mt-1">
              You received a {RarityNames[upgradeResult.newCard.rarity]} {CardNames[upgradeResult.newCard.value]} as consolation
            </p>
          )}
        </div>
      )}
    </div>
  );
}
