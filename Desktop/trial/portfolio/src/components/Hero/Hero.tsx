import anime from "animejs";
import { motion } from "framer-motion";
import { ArrowDown, Mail, MousePointerClick, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../../data/profile";
import { buildSuperellipsePath } from "../../lib/superellipse";
import { ButtonLink } from "../ui/Button";

const CIRCLE_PATH = buildSuperellipsePath(2);
const SQUIRCLE_PATH = buildSuperellipsePath(4.8);

const terminalLines = [
  { command: "whoami", output: profile.role },
  { command: "cat interests.txt", output: profile.interests.join(" / ") },
  { command: "ls ./skills/", output: profile.stack.join("  ") },
  { command: 'echo "Building things that matter."', output: "Building things that matter." },
];

const asciiAlphabet = "01{}[]<>/\\|#$%&*@+-=_:;.,~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function buildAsciiParticles(count = 180) {
  return Array.from({ length: count }, (_, index) => ({
    char: asciiAlphabet[(index * 23 + index ** 2) % asciiAlphabet.length],
    left: `${(index * 37) % 100}%`,
    top: `${(index * 61) % 100}%`,
    x: ((index * 29) % 180) - 90,
    y: ((index * 43) % 180) - 90,
  }));
}

export function Hero() {
  const [cardMode, setCardMode] = useState<"photo" | "morph" | "terminal">("photo");
  const [shapeExpanded, setShapeExpanded] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(true);
  const asciiParticles = useMemo(() => buildAsciiParticles(), []);
  const morphingRef = useRef(false);
  const shapePath = shapeExpanded ? SQUIRCLE_PATH : CIRCLE_PATH;

  useEffect(() => {
    anime({
      targets: ".hero-line",
      opacity: [0, 1],
      translateY: [6, 0],
      delay: anime.stagger(145, { start: 450 }),
      duration: 420,
      easing: "easeOutQuad",
    });
  }, []);

  useEffect(() => {
    if (cardMode !== "morph") return;

    anime.set(".profile-object", { scaleX: 1, scaleY: 1 });
    anime.set(".ascii-particle", { opacity: 0, scale: 0.45, translateX: 0, translateY: 0 });
    anime.set(".morph-face", { opacity: 1 });
    anime.set(".terminal-face", { opacity: 0, scale: 0.96, translateY: 14 });

    anime
      .timeline({
        easing: "easeOutExpo",
        complete: () => {
          anime.set(".morph-face", { opacity: 0 });
          setCardMode("terminal");
          morphingRef.current = false;
        },
      })
      .add(
        {
          targets: ".profile-shape",
          borderRadius: ["50%", "28%"],
          duration: 980,
          easing: "easeInOutCubic",
        },
        0,
      )
      .add(
        {
          targets: ".profile-object",
          scaleX: [1, 1.035, 1],
          scaleY: [1, 0.985, 1],
          duration: 920,
          easing: "easeInOutSine",
        },
        0,
      )
      .add({
        targets: ".photo-face",
        opacity: [1, 0],
        scale: [1, 1.035],
        filter: ["blur(0px)", "blur(14px)"],
        duration: 430,
      })
      .add(
        {
          targets: ".ascii-particle",
          opacity: [0, 1],
          scale: [0.35, 1],
          translateX: (_target: Element, index: number) => asciiParticles[index]?.x || 0,
          translateY: (_target: Element, index: number) => asciiParticles[index]?.y || 0,
          rotate: (_target: Element, index: number) => ((index * 19) % 90) - 45,
          delay: anime.stagger(3),
          duration: 620,
        },
        "-=360",
      )
      .add(
        {
          targets: ".ascii-particle",
          translateX: 0,
          translateY: 0,
          rotate: 0,
          opacity: [1, 0],
          scale: [1, 0.35],
          delay: anime.stagger(2, { direction: "reverse" }),
          duration: 430,
        },
        "-=140",
      )
      .add(
        {
          targets: ".terminal-face",
          opacity: [0, 1],
          scale: [0.96, 1],
          translateY: [14, 0],
          duration: 520,
        },
        "-=260",
      );
  }, [asciiParticles, cardMode]);

  useEffect(() => {
    if (cardMode !== "terminal") return;
    anime({
      targets: ".hero-terminal-line",
      opacity: [0, 1],
      translateY: [5, 0],
      delay: anime.stagger(90),
      duration: 280,
      easing: "easeOutQuad",
    });
  }, [cardMode]);

  const revealTerminal = () => {
    if (morphingRef.current) return;

    if (cardMode === "photo") {
      morphingRef.current = true;
      setShapeExpanded(true);
      setCardMode("morph");
      return;
    }

    if (cardMode === "terminal") {
      morphingRef.current = true;
      setShapeExpanded(false);
      anime.remove(".terminal-face");
      anime.remove(".hero-terminal-line");
      anime.remove(".ascii-particle");
      anime.remove(".morph-face");
      anime.set(".morph-face", { opacity: 0 });
      anime.set(".ascii-particle", { opacity: 0, scale: 0.45, translateX: 0, translateY: 0, rotate: 0 });

      anime
        .timeline({
          easing: "easeInOutCubic",
          complete: () => {
            anime.set(".profile-object", { scaleX: 1, scaleY: 1 });
            anime.set(".photo-face", { opacity: 1, scale: 1, filter: "blur(0px)" });
            anime.set(".terminal-face", { opacity: 0, scale: 0.96, translateY: 14 });
            anime.set(".hero-terminal-line", { opacity: 0, translateY: 5 });
            setCardMode("photo");
            morphingRef.current = false;
          },
        })
        .add(
          {
            targets: ".profile-object",
            scaleX: [1, 0.975, 1],
            scaleY: [1, 1.035, 1],
            duration: 860,
            easing: "easeInOutSine",
          },
          0,
        )
        .add(
          {
            targets: ".terminal-face",
            opacity: [1, 0],
            scale: [1, 0.97],
            translateY: [0, 12],
            duration: 420,
          },
          0,
        )
        .add(
          {
            targets: ".photo-face",
            opacity: [0, 1],
            scale: [1.025, 1],
            filter: ["blur(10px)", "blur(0px)"],
            duration: 560,
          },
          180,
        );
    }
  };

  return (
    <section id="hero" className="section-shell flex min-h-[calc(100vh-3.5rem)] items-center">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="reveal">
          <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-lime">
            <span className="h-px w-10 bg-lime" />
            Available for engineering work
          </p>
          <h1 className="font-display text-[4.8rem] leading-[0.88] tracking-normal text-ink sm:text-[7rem] lg:text-[8rem]">
            {profile.name.split(" ")[0]}
            <br />
            <span className="font-serif italic text-lime">Santhosh</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-muted">{profile.bio}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#projects" icon={<ArrowDown className="h-4 w-4" />}>
              View Projects
            </ButtonLink>
            <ButtonLink href="#contact" variant="outline" icon={<Mail className="h-4 w-4" />}>
              Contact
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="rounded border border-line/10 bg-panel/70 px-3 py-1.5 font-mono text-xs text-muted">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="reveal">
          <button
            type="button"
            aria-pressed={cardMode !== "photo"}
            aria-label={cardMode === "terminal" ? "Show profile photo" : "Click to disintegrate card into bash terminal"}
            onClick={revealTerminal}
            disabled={cardMode === "morph"}
            className="profile-object group relative mx-auto block aspect-square w-full max-w-[34rem] text-left outline-none transition duration-300 hover:scale-[1.012] focus-visible:ring-2 focus-visible:ring-lime/70 disabled:cursor-wait"
          >
            <svg className="pointer-events-none absolute -inset-2 overflow-visible drop-shadow-[0_28px_70px_rgb(0_0_0/0.42)]" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d={shapePath}
                animate={{ d: shapePath }}
                transition={{ type: "spring", stiffness: 105, damping: 17, mass: 0.9 }}
                fill="rgb(var(--color-panel))"
                fillOpacity="0.3"
                stroke="rgb(var(--color-line))"
                strokeOpacity="0.055"
                strokeWidth="0.004"
              />
            </svg>

            <svg className="absolute h-0 w-0" aria-hidden="true">
              <defs>
                <clipPath id="profile-superellipse-clip" clipPathUnits="objectBoundingBox">
                  <motion.path d={shapePath} animate={{ d: shapePath }} transition={{ type: "spring", stiffness: 105, damping: 17, mass: 0.9 }} />
                </clipPath>
              </defs>
            </svg>

            <div className="relative aspect-square w-full overflow-hidden bg-panel" style={{ clipPath: "url(#profile-superellipse-clip)" }}>
              <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
                <motion.path
                  d={shapePath}
                  animate={{ d: shapePath }}
                  transition={{ type: "spring", stiffness: 105, damping: 17, mass: 0.9 }}
                  fill="none"
                  stroke="rgb(255 255 255)"
                  strokeOpacity="0.05"
                  strokeWidth="0.0025"
                />
                <motion.path
                  d={shapePath}
                  animate={{ d: shapePath }}
                  transition={{ type: "spring", stiffness: 105, damping: 17, mass: 0.9 }}
                  fill="url(#profile-shine)"
                  opacity="0.72"
                />
                <defs>
                  <linearGradient id="profile-shine" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.16" />
                    <stop offset="34%" stopColor="white" stopOpacity="0" />
                    <stop offset="58%" stopColor="white" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              <div className={`photo-face absolute inset-0 ${cardMode === "terminal" ? "pointer-events-none opacity-0" : ""}`}>
                {photoLoaded ? (
                  <img
                    src={profile.photoUrl}
                    alt={`${profile.name} portrait`}
                    onError={() => setPhotoLoaded(false)}
                    className="h-full w-full object-cover object-[50%_32%] opacity-95 saturate-[0.94] transition duration-700 group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_20%,rgba(190,222,74,0.2),transparent_34rem),linear-gradient(135deg,rgb(28,27,25),rgb(12,12,11))]">
                    <div className="text-center">
                      <div className="font-display text-8xl leading-none text-ink">SPS</div>
                      <div className="mt-3 font-mono text-xs uppercase tracking-[0.24em] text-dim">add /public/profile.jpg</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-canvas/78 via-canvas/38 to-transparent px-[18%] pb-[18%] pt-24">
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-canvas/70 px-4 py-2 font-mono text-[0.68rem] text-ink shadow-[0_10px_28px_rgb(0_0_0/0.35)] backdrop-blur-md transition group-hover:border-white/30 group-hover:bg-canvas/80">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      click me
                    </span>
                </div>
              </div>

              <div className={`morph-face absolute inset-0 bg-canvas ${cardMode === "morph" ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={cardMode !== "morph"}>
                {asciiParticles.map((particle, index) => (
                  <span
                    key={`${particle.char}-${index}`}
                    className="ascii-particle absolute font-mono text-sm font-semibold text-lime"
                    style={{ left: particle.left, top: particle.top }}
                  >
                    {particle.char}
                  </span>
                ))}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgb(var(--color-canvas)/0.78))]" />
              </div>

              <div className={`terminal-face absolute inset-0 ${cardMode === "terminal" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                <div className="flex h-full flex-col justify-center bg-[radial-gradient(circle_at_40%_18%,rgb(255_255_255/0.07),transparent_18rem),linear-gradient(145deg,rgb(8_9_8),rgb(3_5_4))] px-8 py-10 sm:px-12">
                  <div className="mx-auto mb-5 flex w-full max-w-[22rem] items-center gap-3 border-b border-line/10 pb-3">
                    <div className="terminal-dots" aria-hidden="true">
                      <span className="terminal-dot bg-[#ff5f57]" />
                      <span className="terminal-dot bg-[#ffbd2e]" />
                      <span className="terminal-dot bg-[#28ca41]" />
                    </div>
                    <div className="min-w-0 truncate font-mono text-[0.65rem] uppercase tracking-[0.14em] text-dim">profile - bash</div>
                  </div>
                  <div className="mx-auto w-full max-w-[22rem] space-y-2 font-mono text-xs sm:text-sm">
                    {terminalLines.map((line) => (
                      <div key={line.command} className="hero-terminal-line opacity-0">
                        <div>
                          <span className="text-lime">&gt;</span> <span className="text-ink">{line.command}</span>
                        </div>
                        <div className="pl-4 leading-6 text-muted">{line.output}</div>
                      </div>
                    ))}
                    <div className="hero-terminal-line flex items-center gap-2 opacity-0">
                      <span className="text-lime">&gt;</span>
                      <Terminal className="h-4 w-4 text-blue" />
                      <span className="h-5 w-2 animate-blink bg-ink" />
                    </div>
                    <div className="pt-4 font-mono text-[0.68rem] text-dim">Click again to return to profile.card</div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
