import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../../data/projects";
import { cardProjects } from "./projectData";
import styles from "./ProjectEcosystem.module.css";

gsap.registerPlugin(ScrollTrigger);

interface ProjectEcosystemProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

export default function ProjectEcosystem({ projects, onProjectSelect }: ProjectEcosystemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map core dynamic projects metadata from data database
  const mappedCards = useMemo(() => {
    return cardProjects.map((c) => {
      const proj = projects[c.index] || {
        name: `System-0${c.index + 1}`,
        description: "Diagnostic interface placeholder for internal subsystem.",
        stack: ["Subsystem"],
        status: "online",
        year: "2026",
        links: {},
      };
      return {
        ...c,
        project: proj,
      };
    });
  }, [projects]);

  // Event handler: Card Hover Enter
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>, pulseIds: string[], accent: string) => {
    const card = e.currentTarget;
    gsap.set(card, { zIndex: 50 });

    // Springy scale-up and subtle drop-shadow
    gsap.to(card, {
      scale: 1.02,
      filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.3))",
      duration: 0.4,
      ease: "back.out(1.5)",
    });

    const path = card.querySelector(".puzzle-card path");
    if (path) {
      const hoverFills: Record<string, string> = {
        "#bede4a": "rgba(28, 34, 20, 0.92)",
        "#06b6d4": "rgba(12, 33, 36, 0.92)",
        "#8b5cf6": "rgba(25, 20, 36, 0.92)",
        "#f59e0b": "rgba(36, 27, 12, 0.92)",
        "#ff4fc3": "rgba(36, 12, 26, 0.92)",
      };
      const fillVal = hoverFills[accent] || "rgba(45, 46, 39, 0.92)";

      gsap.to(path, {
        fill: fillVal,
        stroke: accent,
        strokeWidth: 1.8,
        duration: 0.3,
      });
    }

    const tags = card.querySelectorAll(".tags span");
    if (tags.length) {
      gsap.to(tags, {
        borderColor: accent + "88",
        backgroundColor: accent + "15",
        color: accent,
        duration: 0.3,
        stagger: 0.03,
      });
    }

    // Trigger glowing signal flow pulse
    pulseIds.forEach((id) => {
      const pulseEl = containerRef.current?.querySelector(id);
      if (pulseEl) {
        gsap.killTweensOf(pulseEl);
        gsap.fromTo(
          pulseEl,
          { strokeDashoffset: 120, stroke: accent, strokeWidth: 3.5, opacity: 1 },
          {
            strokeDashoffset: -120,
            duration: 0.6,
            ease: "power1.out",
            onComplete: () => {
              gsap.set(pulseEl, { clearProps: "all" });
            },
          }
        );
      }
    });
  };

  // Event handler: Card Hover Leave
  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      scale: 1,
      filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.15))",
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(card, { zIndex: 10 });
      },
    });

    const path = card.querySelector(".puzzle-card path");
    if (path) {
      gsap.to(path, {
        fill: "var(--mono-bg)",
        stroke: "var(--mono-border)",
        strokeWidth: 1.5,
        duration: 0.3,
      });
    }

    const tags = card.querySelectorAll(".tags span");
    if (tags.length) {
      gsap.to(tags, {
        borderColor: "var(--mono-border)",
        backgroundColor: "var(--mono-dark)",
        color: "var(--mono-comment)",
        duration: 0.3,
      });
    }
  };

  // Event handler: Card Press Down (Tactile)
  const handleCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 0.98,
      filter: "drop-shadow(0px 0px calc(4px * var(--u)) var(--accent-glow))",
      duration: 0.1,
      ease: "power2.out",
    });
  };

  // Event handler: Card Release (Tactile)
  const handleCardMouseUp = (e: React.MouseEvent<HTMLDivElement>, accent: string) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      filter: `drop-shadow(0px 0px calc(10px * var(--u)) ${accent})`,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  // Parallax grid move on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    const surface = e.currentTarget;
    const rect = surface.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPercent = mouseX / rect.width - 0.5;
    const yPercent = mouseY / rect.height - 0.5;

    gsap.to(surface, {
      "--grid-x": `${xPercent * 30}px`,
      "--grid-y": `${yPercent * 30}px`,
      duration: 0.8,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    gsap.to(e.currentTarget, {
      "--grid-x": "0px",
      "--grid-y": "0px",
      duration: 1,
      ease: "power2.out",
    });
  };

  // GSAP Animation Timeline & ScrollTrigger configuration
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Use gsap.context to manage scoped selectors and easy unmount cleanup
    const ctx = gsap.context(() => {
      if (window.innerWidth < 1024) {
        // Mobile Fallback Settings
        const bootTitle = root.querySelector(".boot-title");
        if (bootTitle) {
          bootTitle.textContent = "Project Ecosystem";
          gsap.set(bootTitle, { opacity: 1 });
        }
        gsap.set(".project-card", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" });
        gsap.set(".board-header", { opacity: 1 });
        gsap.set(".board-header .label", { opacity: 1 });
        gsap.set(".ct-scan-viewport", { opacity: 0, scale: 1, pointerEvents: "none" });
        const surface = root.querySelector(".ecosystem-surface") as HTMLElement | null;
        if (surface) {
          surface.style.backgroundColor = "var(--mono-bg)";
          surface.style.setProperty("--grid-opacity", "1");
        }
        return;
      }

      // Pre-calculate path lengths for circuit tracing drawings
      const traces = [
        root.querySelector("#trace-rvmn-workspace") as SVGPathElement | null,
        root.querySelector("#trace-workspace-datahub") as SVGPathElement | null,
        root.querySelector("#trace-workspace-authcore") as SVGPathElement | null,
        root.querySelector("#trace-authcore-launcher") as SVGPathElement | null,
      ];

      traces.forEach((trace) => {
        if (trace) {
          const length = trace.getTotalLength();
          gsap.set(trace, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        }
      });

      // SVG workstation coordinate offsets
      gsap.set("#group-corners-center", { svgOrigin: "701 561" });
      gsap.set("#group-corner-tl", { x: 546, y: 406 });
      gsap.set("#group-corner-tr", { x: -546, y: 406 });
      gsap.set("#group-corner-bl", { x: 546, y: -406 });
      gsap.set("#group-corner-br", { x: -546, y: -406 });
      gsap.set("#frame-side-top, #frame-side-bottom", { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set("#frame-side-left, #frame-side-right", { scaleY: 0, transformOrigin: "50% 50%" });
      gsap.set(".project-card", {
        opacity: 0,
        y: 60,
        scale: 0.9,
        rotateX: -45,
        transformOrigin: "50% 100%",
        pointerEvents: "none",
      });
      gsap.set(".board-header", { opacity: 0 });
      gsap.set(".board-header .label, .board-header h1.boot-title", { opacity: 0 });
      gsap.set(".ct-scan-viewport", { opacity: 1, scale: 1 });
      gsap.set(".indicator", { opacity: 0 });
      gsap.set(".ecosystem-surface", { opacity: 0 });

      // Infinite spinning wheel loading animation
      const spinTween = gsap.to("#group-corners-center", {
        rotation: 360,
        svgOrigin: "701 561",
        repeat: -1,
        duration: 1.2,
        ease: "none",
      });

      // Pause spin tween if page is already scrolled down
      const initialScroll = window.scrollY || document.documentElement.scrollTop;
      if (initialScroll > 10) {
        spinTween.pause();
        gsap.set("#group-corners-center", { rotation: 0, svgOrigin: "701 561" });
      }

      // Master Scroll Scrub Timeline
      const assemblyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: root.querySelector(".ecosystem-board"),
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress === 0) {
              if (!spinTween.isActive()) {
                spinTween.play();
              }
            } else {
              if (spinTween.isActive()) {
                spinTween.pause();
                gsap.to("#group-corners-center", {
                  rotation: 0,
                  svgOrigin: "701 561",
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
          },
        },
      });

      // 1. 0% to 15% Scroll: Collapse spinning corners to edges and CRT screen fades
      assemblyTimeline.to("#group-corner-tl", { x: 0, y: 0, ease: "power2.out", duration: 0.15 }, 0);
      assemblyTimeline.to("#group-corner-tr", { x: 0, y: 0, ease: "power2.out", duration: 0.15 }, 0);
      assemblyTimeline.to("#group-corner-bl", { x: 0, y: 0, ease: "power2.out", duration: 0.15 }, 0);
      assemblyTimeline.to("#group-corner-br", { x: 0, y: 0, ease: "power2.out", duration: 0.15 }, 0);

      assemblyTimeline.to(".ct-scan-flash", { opacity: 1, ease: "power1.in", duration: 0.04 }, 0);
      assemblyTimeline.to(".ct-scan-viewport", { scaleY: 0.005, scaleX: 1.1, ease: "power2.inOut", duration: 0.06 }, 0.04);
      assemblyTimeline.to(".ct-scan-viewport", { scaleX: 0, scaleY: 0, opacity: 0, ease: "power2.in", duration: 0.05 }, 0.1);

      // 2. 15% to 30% Scroll: Workstation border frame lines expand
      assemblyTimeline.to("#frame-side-top, #frame-side-bottom", { scaleX: 1, ease: "power1.inOut", duration: 0.15 }, 0.15);
      assemblyTimeline.to("#frame-side-left, #frame-side-right", { scaleY: 1, ease: "power1.inOut", duration: 0.15 }, 0.15);

      // 3. 30% to 45% Scroll: Render backing surface plate
      assemblyTimeline.to(".ecosystem-surface", { opacity: 1, backgroundColor: "var(--mono-bg)", ease: "power1.inOut", duration: 0.15 }, 0.3);

      // 4. 45% to 55% Scroll: Background grid glitching
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.8, duration: 0.02 }, 0.45);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.1, duration: 0.01 }, 0.47);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.9, duration: 0.02 }, 0.48);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.2, duration: 0.01 }, 0.5);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.7, duration: 0.02 }, 0.51);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 0.15, duration: 0.01 }, 0.53);
      assemblyTimeline.to(".ecosystem-surface", { "--grid-opacity": 1.0, duration: 0.02 }, 0.54);

      // Brightness flickering on borders
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(1.2) opacity(1)", duration: 0.02 }, 0.45);
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(0.3) opacity(0.4)", duration: 0.01 }, 0.47);
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(1.1) opacity(0.9)", duration: 0.02 }, 0.48);
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(0.5) opacity(0.6)", duration: 0.01 }, 0.5);
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(1.0) opacity(0.9)", duration: 0.02 }, 0.51);
      assemblyTimeline.to(".board-frame", { filter: "grayscale(1) brightness(0.4) opacity(0.5)", duration: 0.01 }, 0.53);
      assemblyTimeline.to(".board-frame", { filter: "drop-shadow(0 0 12px rgba(190, 222, 74, 0.25)) brightness(1.05) opacity(0.95)", duration: 0.02 }, 0.54);

      // 5. 55% to 65% Scroll: Header typewriter text boot sequence
      assemblyTimeline.to(".board-header", { opacity: 1, ease: "power1.inOut", duration: 0.1 }, 0.55);
      assemblyTimeline.to(".board-header .label", { opacity: 1, ease: "power1.inOut", duration: 0.1 }, 0.55);

      const titleObj = { charCount: 0 };
      const titleText = "Project Ecosystem";
      const titleEl = root.querySelector(".boot-title") as HTMLElement | null;
      assemblyTimeline.to(titleObj, {
        charCount: titleText.length,
        ease: "none",
        duration: 0.1,
        onUpdate: () => {
          const count = Math.floor(titleObj.charCount);
          if (titleEl) {
            titleEl.textContent = titleText.substring(0, count);
            titleEl.style.opacity = "1";
          }
        },
      }, 0.55);

      // 6. 65% to 75% Scroll: Cards emerge cascade
      const cardsDeployOrder = [".card1", ".card2", ".card3", ".card4", ".card5"];
      cardsDeployOrder.forEach((selector, idx) => {
        const startScroll = 0.65 + idx * 0.015;
        assemblyTimeline.to(selector, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          ease: "back.out(1.4)",
          duration: 0.04,
        }, startScroll);
      });

      // 7. 75% to 85% Scroll: Drawing PCB lines strokeDashoffset
      const trace1 = root.querySelector("#trace-rvmn-workspace");
      const trace2 = root.querySelector("#trace-workspace-datahub");
      const trace3 = root.querySelector("#trace-workspace-authcore");
      const trace4 = root.querySelector("#trace-authcore-launcher");

      if (trace1) assemblyTimeline.to(trace1, { strokeDashoffset: 0, ease: "sine.inOut", duration: 0.03 }, 0.75);
      if (trace2) assemblyTimeline.to(trace2, { strokeDashoffset: 0, ease: "sine.inOut", duration: 0.04 }, 0.78);
      if (trace3) assemblyTimeline.to(trace3, { strokeDashoffset: 0, ease: "sine.inOut", duration: 0.04 }, 0.78);
      if (trace4) assemblyTimeline.to(trace4, { strokeDashoffset: 0, ease: "sine.inOut", duration: 0.03 }, 0.82);

      // 8. 85% to 95% Scroll: LEDs active glows
      assemblyTimeline.to(".connection-pulse", { opacity: 0.7, ease: "power1.inOut", duration: 0.1 }, 0.85);
      assemblyTimeline.to(".indicator", { opacity: 1, ease: "power1.inOut", duration: 0.1 }, 0.85);

      // 9. 95% to 100% Scroll: Interface interaction online unlock
      assemblyTimeline.to(".project-card", { pointerEvents: "auto", duration: 0.05 }, 0.95);

      assemblyTimeline.eventCallback("onUpdate", () => {
        const progress = assemblyTimeline.progress();
        const connectionSvg = root.querySelector(".connection-svg");
        if (connectionSvg) {
          if (progress >= 0.95) {
            connectionSvg.classList.add("active");
          } else {
            connectionSvg.classList.remove("active");
          }
        }
      });
    }, root);

    // Electron Spark Particle Loops Setup (Only on Desktop)
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (window.innerWidth >= 1024) {
      const boardEl = root.querySelector(".board");
      if (boardEl) {
        const spawnElectron = () => {
          const el = document.createElement("div");
          el.className = "electron";
          boardEl.appendChild(el);

          const startX = Math.floor(Math.random() * 20) * 50;
          const startY = Math.floor(Math.random() * 12) * 50;

          gsap.set(el, { x: startX, y: startY, opacity: 0 });

          const tl = gsap.timeline({
            onComplete: () => el.remove(),
          });

          tl.to(el, { opacity: 0.8, duration: 0.3 });

          let currentX = startX;
          let currentY = startY;
          const steps = 3;

          for (let i = 0; i < steps; i++) {
            const moveHorizontal = Math.random() > 0.5;
            const distance = (Math.random() > 0.5 ? 1 : -1) * (100 + Math.floor(Math.random() * 3) * 50);

            if (moveHorizontal) {
              currentX += distance;
            } else {
              currentY += distance;
            }

            tl.to(el, {
              x: currentX,
              y: currentY,
              duration: Math.abs(distance) / 150,
              ease: "power1.inOut",
            });
          }

          tl.to(el, { opacity: 0, duration: 0.4 });
        };

        intervalId = setInterval(spawnElectron, 800);
      }
    }

    // Context Cleanups
    return () => {
      ctx.revert();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.scrollPinWrapper}>
      <section className="ecosystem-board">
        {/* Inline SVG Workstation Frame */}
        <svg
          id="engineering-workstation-frame"
          className="board-frame engineering-workstation-frame"
          viewBox="0 0 1402 1122"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          style={{ overflow: "visible" }}
        >
          {/* Sides */}
          <path
            id="frame-side-top"
            className="frame__side frame__side--top"
            fill="var(--frame-primary,#b7ff00)"
            d="M 86.975865,9.4800291 l 6.168823,7.0533229 1214.786712,0.0808 7.409,-6.543025 -1.6358,-1.9564925 -6.6392,6.0298465 L 95.066299,14.240701 88.972306,8.2750017 Z"
          />
          <path
            id="frame-side-bottom"
            className="frame__side frame__side--bottom"
            fill="var(--frame-primary,#b7ff00)"
            d="m 90.864651,1107.5031 1.154651,0.1283 0.577326,0.9622 1220.886372,0.025 0.045,2.7896 -1221.412777,0.055 -2.806444,-2.9347 z"
          />
          <path
            id="frame-side-left"
            className="frame__side frame__side--left"
            fill="var(--frame-primary,#b7ff00)"
            d="m 17.42401,81.595366 1.756033,0.0882 0.296681,2.172989 -4.757731,4.219263 0.02687,948.079482 6.708942,8.1901 -2.630822,0.091 -7.348156,-7.7564 -0.04536,-949.409004 z"
          />
          <path
            id="frame-side-right"
            className="frame__side frame__side--right"
            fill="var(--frame-primary,#b7ff00)"
            d="m 1382.9049,82.598723 1.769,-1.043257 6.6678,5.760592 0.4082,116.073662 -10.0697,10.84079 -0.045,67.72098 10.2057,10.614 0.045,507.83927 -10.0697,10.93151 -0.1814,54.204 10.3418,11.06759 -0.1361,159.79974 -6.3502,6.1235 -1.4515,-2.6762 4.2184,-3.7648 0.1814,-158.39362 -10.1604,-9.61611 -0.2722,-58.55846 10.1605,-10.29649 0.136,-505.16308 -9.8882,-10.97688 -0.2722,-70.03428 10.0244,-10.11505 0.1814,-114.213943 z"
          />

          {/* Corners */}
          <g id="group-corners-center">
            <g id="group-corner-tl" className="corner-group">
              <path
                id="frame-corner-top-left"
                className="frame__corner frame__corner--top-left"
                fill="var(--frame-primary,#b7ff00)"
                d="M 6.2543618,19.180043 18.217833,6.6713192 l 64.917068,-0.032074 5.3563,4.8110478 0.09622,8.563665 -5.067637,5.420447 h -19.94981 l 0.09622,21.26483 -16.293415,16.582077 -21.681787,0.320736 -1.090504,1.026357 0.224515,10.488084 -2.790407,3.367733 -11.06541,0.320736 -5.5808148,-5.388373 z"
              />
              <path
                id="corner-plate-top-left"
                className="corner-plate corner-plate--top-left"
                fill="var(--frame-secondary,#111111)"
                d="M 8.6635673,20.842456 C 19.481687,9.933619 19.481687,9.933619 19.481687,9.933619 l 62.890241,-0.4309104 2.834937,2.3133084 0.226795,7.348157 -3.515322,3.538001 -19.254892,0.06804 -1.905077,2.041154 -0.430911,21.159969 -14.174685,14.537557 -21.296046,-0.204115 -3.288527,3.424603 -0.09072,10.976876 -1.224692,1.020578 -7.552272,-0.04536 -3.7647968,-3.60604 z"
              />
              <path
                id="fastener-top-left"
                className="fastener fastener--top-left"
                fill="var(--frame-hardware,#d8d8d8)"
                d="M 50.529916,36.060398 A 14.696313,14.197365 0 0 1 35.833603,50.257763 14.696313,14.197365 0 0 1 21.13729,36.060398 A 14.696313,14.197365 0 0 1 35.833603,21.863033 14.696313,14.197365 0 0 1 50.529916,36.060398 Z"
              />
              <path
                id="indicator-top-left"
                className="indicator indicator--top-left"
                fill="var(--frame-accent,#00d9ff)"
                d="M 27.283433,27.737023 c -0.238135,1.190674 -0.238135,1.190674 -0.238135,1.190674 l 4.343124,4.252405 c 0,0 -0.91852,7.17806 0.782442,5.182265 1.700963,-1.995796 -5.227623,5.454418 -5.227623,5.454418 l 0.04536,1.202014 1.020577,0.158756 5.329681,-5.057527 c 0,0 6.577054,0.816461 5.601836,-0.272154 -0.975218,-1.088616 4.830732,5.012168 4.830732,5.012168 h 0.952539 l -0.04536,-1.088616 -4.808053,-5.261643 c 0,0 2.26795,-6.304899 0.816462,-4.808053 -1.451488,1.496847 -1.451488,1.496847 -1.451488,1.496847 l 5.352361,-5.533797 0.272154,-1.542206 -1.814359,0.04536 -4.309105,4.218387 -5.216284,-0.45359 c 2.131973,-0.997899 2.131973,-0.997899 2.131973,-0.997899 l 2.993693,1.315411 0.04536,0.45359 -5.170925,-0.771102"
              />
            </g>

            <g id="group-corner-tr" className="corner-group">
              <path
                id="frame-corner-top-right"
                className="frame__corner frame__corner--top-right"
                fill="var(--frame-primary,#b7ff00)"
                d="m 1313.5283,11.725299 -0.2041,8.141939 5.5565,5.511118 19.6631,0.02268 -0.045,21.205328 16.488,16.714789 h 21.7042 l 1.7237,1.383449 -0.1134,11.22635 2.2906,2.517424 10.546,0.226795 5.1936,-4.740015 0.4082,-54.453468 -12.2696,-12.9046333 h -66.0654 z"
              />
              <path
                id="corner-plate-top-right"
                className="corner-plate corner-plate--top-right"
                fill="var(--frame-secondary,#111111)"
                d="m 1317.2705,12.292287 2.6308,-2.7442194 62.2779,-0.090718 11.0902,10.7954404 0.2268,52.11748 -3.8101,3.696758 -7.2348,-0.249474 -1.3721,-1.37211 -0.102,-10.750081 -2.835,-3.027712 -22.4211,-0.224857 -12.8776,-13.118123 V 25.274036 l -3.4158,-3.095107 -18.4423,0.112258 -4.1696,-3.207365 z"
              />
              <path
                id="fastener-top-right"
                className="fastener fastener--top-right"
                fill="var(--frame-hardware,#d8d8d8)"
                d="M 1380.8948,35.914516 a 14.696313,14.197365 0 0 1 -14.6963,14.197365 14.696313,14.197365 0 0 1 -14.6963,-14.197365 14.696313,14.197365 0 0 1 14.6963,-14.197364 14.696313,14.197365 0 0 1 14.6963,14.197364 z"
              />
              <path
                id="indicator-top-right"
                className="indicator indicator--top-right"
                fill="var(--frame-accent,#00d9ff)"
                d="M 1357.6985,27.223845 c -0.2382,1.190674 -0.2382,1.190674 -0.2382,1.190674 l 4.3431,4.252405 c 0,0 -0.9186,7.17806 0.7824,5.182265 1.701,-1.995796 -5.2276,5.454418 -5.2276,5.454418 l 0.045,1.202014 1.0205,0.158756 5.3297,-5.057527 c 0,0 6.5771,0.816461 5.6019,-0.272154 -0.9753,-1.088616 4.8307,5.012168 4.8307,5.012168 h 0.9525 l -0.045,-1.088616 -4.808,-5.261643 c 0,0 2.2679,-6.304899 0.8164,-4.808053 -1.4514,1.496847 -1.4514,1.496847 -1.4514,1.496847 l 5.3523,-5.533797 0.2722,-1.542206 -1.8144,0.04536 -4.3091,4.218387 -5.2163,-0.45359 c 2.1319,-0.997899 2.1319,-0.997899 2.1319,-0.997899 l 2.9937,1.315411 0.045,0.45359 -5.1709,-0.771102"
              />
            </g>

            <g id="group-corner-bl" className="corner-group">
              <path
                id="frame-corner-bottom-left"
                className="frame__corner frame__corner--bottom-left"
                fill="var(--frame-primary,#b7ff00)"
                d="m 18.551827,1044.6402 -6.645092,-0.136 -5.5791557,5.1029 0.1133974,55.1338 11.5438633,11.6799 65.747858,0.1134 4.558578,-5.1936 0.02268,-7.6203 -5.987387,-6.1234 -18.597187,0.045 v -20.6837 l -16.329236,-16.465 H 25.899984 l -1.451488,-1.4061 -0.09072,-11.8387 -2.494744,-2.5401 z"
              />
              <path
                id="corner-plate-bottom-left"
                className="corner-plate corner-plate--bottom-left"
                fill="var(--frame-secondary,#111111)"
                d="m 8.6862468,1051.6028 3.9689122,-3.6967 8.708926,-0.045 0.04536,12.2243 3.401924,3.3792 21.13729,0.2722 13.789133,14.0386 0.113398,20.1847 2.517424,2.4948 18.960058,0.1134 4.082309,3.9916 0.09072,5.6018 -3.039052,2.9937 -63.003639,0.1588 -10.6366832,-10.3646 z"
              />
              <path
                id="fastener-bottom-left"
                className="fastener fastener--bottom-left"
                fill="var(--frame-hardware,#d8d8d8)"
                d="m 50.540296,1088.4172 a 14.696313,14.197365 0 0 1 -14.696313,14.1974 14.696313,14.197365 0 0 1 -14.696313,-14.1974 14.696313,14.197365 0 0 1 14.696313,-14.1973 14.696313,14.197365 0 0 1 14.696313,14.1973 z"
              />
              <path
                id="indicator-bottom-left"
                className="indicator indicator--bottom-left"
                fill="var(--frame-accent,#00d9ff)"
                d="M 27.400581,1079.7064 c -0.2382,1.1907 -0.2382,1.1907 -0.2382,1.1907 l 4.3432,4.2524 c 0,0 -0.9186,7.1780 0.7824,5.1822 1.701,-1.9958 -5.2276,5.4545 -5.2276,5.4545 l 0.045,1.202 1.0205,0.1587 5.3297,-5.0575 c 0,0 6.5771,0.8165 5.6019,-0.2722 -0.9753,-1.0886 4.8307,5.0122 4.8307,5.0122 h 0.9525 l -0.045,-1.0886 -4.808,-5.2617 c 0,0 2.2679,-6.3049 0.8164,-4.808 -1.4514,1.4968 -1.4514,1.4968 -1.4514,1.4968 l 5.3523,-5.5338 0.2722,-1.5422 -1.8144,0.045 -4.3091,4.2184 -5.2163,-0.4536 c 2.1319,-0.9979 2.1319,-0.9979 2.1319,-0.9979 l 2.9937,1.3154 0.045,0.4536 -5.1709,-0.7711"
              />
            </g>

            <g id="group-corner-br" className="corner-group">
              <path
                id="frame-corner-bottom-right"
                className="frame__corner frame__corner--bottom-right"
                fill="var(--frame-primary,#b7ff00)"
                d="m 1380.9631,1044.5105 9.2051,0.1283 6.4147,5.8374 0.064,53.8516 -12.2521,12.2522 -66.1038,0.096 -4.6507,-5.1318 -0.064,-7.3769 6.3827,-6.511 18.6989,0.064 0.7698,-21.8743 14.2247,-15.283 22.1468,0.032 2.5245,-2.1207 0.045,-11.4985 z"
              />
              <path
                id="corner-plate-bottom-right"
                className="corner-plate corner-plate--bottom-right"
                fill="var(--frame-secondary,#111111)"
                d="m 1354.6916,1063.5776 22.1806,-0.1814 4.6266,-3.9462 -0.045,-11.5212 7.4843,-0.2268 4.2637,3.4473 0.2268,52.0267 -10.0243,9.8883 -63.548,0.2721 -3.1297,-2.7669 -0.091,-5.2162 4.0823,-4.2184 19.1869,-0.3175 2.6762,-2.1773 -0.045,-21.8177 z"
              />
              <path
                id="fastener-bottom-right"
                className="fastener fastener--bottom-right"
                fill="var(--frame-hardware,#d8d8d8)"
                d="M 1380.752,1087.6548 a 14.696313,14.197365 0 0 1 -14.6963,14.1973 14.696313,14.197365 0 0 1 -14.6963,-14.1973 14.696313,14.197365 0 0 1 14.6963,-14.1974 14.696313,14.197365 0 0 1 14.6963,14.1974 z"
              />
              <path
                id="indicator-bottom-right"
                className="indicator indicator--bottom-right"
                fill="var(--frame-accent,#00d9ff)"
                d="m 1357.6553,1079.3856 c -0.2382,1.1907 -0.2382,1.1907 -0.2382,1.1907 l 4.3432,4.2524 c 0,0 -0.9186,7.1781 0.7824,5.1823 1.701,-1.9958 -5.2276,5.4544 -5.2276,5.4544 l 0.045,1.202 1.0205,0.1588 5.3297,-5.0575 c 0,0 6.5771,0.8164 5.6019,-0.2722 -0.9753,-1.0886 4.8307,5.0122 4.8307,5.0122 h 0.9525 l -0.045,-1.0886 -4.808,-5.2617 c 0,0 2.2679,-6.3049 0.8164,-4.808 -1.4514,1.4968 -1.4514,1.4968 -1.4514,1.4968 l 5.3523,-5.5338 0.2722,-1.5422 -1.8144,0.045 -4.3091,4.2183 -5.2163,-0.4535 c 2.1319,-0.9979 2.1319,-0.9979 2.1319,-0.9979 l 2.9937,1.3154 0.045,0.4536 -5.1709,-0.7711"
              />
            </g>
          </g>
        </svg>

        {/* Centered CRT TV / CT Scan Viewport overlay */}
        <div className="ct-scan-viewport">
          <div className="ct-scan-grid"></div>
          <div className="ct-scan-sweep"></div>
          <div className="ct-scan-scanlines"></div>
          <div className="ct-scan-grain"></div>
          <div className="ct-scan-flash"></div>
          <div className="ct-scan-text">My Projects</div>
        </div>

        {/* Content Area */}
        <div className="board-content">
          {/* Header */}
          <div className="board-header">
            <span className="label">DEPLOYABLE SYSTEMS</span>
            <h1 className="boot-title"></h1>
          </div>

          {/* Work Area */}
          <div className="ecosystem-surface" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div className="board">
              {/* SVG connection traces between cards */}
              <svg className="connection-svg" viewBox="0 0 1222 828" preserveAspectRatio="none">
                {/* Background connections (traces) */}
                <path className="connection-trace" id="trace-rvmn-workspace" d="M 422 250 H 800" />
                <path className="connection-trace" id="trace-workspace-datahub" d="M 800 250 V 386 H 233 V 523" />
                <path className="connection-trace" id="trace-workspace-authcore" d="M 800 250 V 386 H 611 V 523" />
                <path className="connection-trace" id="trace-authcore-launcher" d="M 611 523 H 989" />

                {/* Glowing animated signals */}
                <path className="connection-pulse" id="pulse-rvmn-workspace" d="M 422 250 H 800" />
                <path className="connection-pulse" id="pulse-workspace-datahub" d="M 800 250 V 386 H 233 V 523" />
                <path className="connection-pulse" id="pulse-workspace-authcore" d="M 800 250 V 386 H 611 V 523" />
                <path className="connection-pulse" id="pulse-authcore-launcher" d="M 611 523 H 989" />
              </svg>

              {/* Cards mapped dynamically */}
              {mappedCards.map((c) => {
                const project = c.project;
                const statusLabel = project.status.toUpperCase();
                return (
                  <div
                    key={c.key}
                    className={`project-card ${c.class}`}
                    style={{
                      left: `calc(${c.x.toFixed(2)} * var(--u))`,
                      top: `calc(${c.y.toFixed(2)} * var(--u))`
                    }}
                    onMouseEnter={(e) => handleCardMouseEnter(e, c.pulseIds, c.accent)}
                    onMouseLeave={handleCardMouseLeave}
                    onMouseDown={handleCardMouseDown}
                    onMouseUp={(e) => handleCardMouseUp(e, c.accent)}
                    onClick={() => onProjectSelect(project)}
                  >
                    <svg className="puzzle-card" viewBox="0 0 400 400">
                      <path
                        d="M150 20 H250 Q280 20 280 50 V120 H350 Q380 120 380 150 V250 Q380 280 350 280 H280 V350 Q280 380 250 380 H150 Q120 380 120 350 V280 H50 Q20 280 20 250 V150 Q20 120 50 120 H120 V50 Q120 20 150 20 Z"
                      />
                    </svg>
                    <div className="card-content">
                      <div className="card-meta">
                        <span>{c.label}</span>
                        <span className="status" style={{ color: c.accent }}>{statusLabel}</span>
                      </div>
                      <h3 className="font-sans">{project.name.toUpperCase()}</h3>
                      <p className="font-sans">{project.description}</p>
                      <div className="stats font-sans" style={{ color: c.accent }}>
                        <div>STATUS: {statusLabel}</div>
                        <div>YEAR: {project.year}</div>
                      </div>
                      <div className="tags font-sans">
                        {project.stack.slice(0, 3).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
