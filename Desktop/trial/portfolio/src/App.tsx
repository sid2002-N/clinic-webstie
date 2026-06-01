import { useCallback, useEffect, useState } from "react";
import { BootScreen } from "./components/BootScreen";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { SiteLayout } from "./layouts/SiteLayout";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { WorldsPage } from "./pages/WorldsPage";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const completeBoot = useCallback(() => setBooted(true), []);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  const page = path === "/learn" ? <LearnPage /> : path === "/worlds" ? <WorldsPage /> : <HomePage />;

  return (
    <>
      <BootScreen onComplete={completeBoot} />
      <SiteLayout onOpenCommandPalette={() => setPaletteOpen(true)} booted={booted}>
        {page}
      </SiteLayout>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
