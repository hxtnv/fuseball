import { useState } from "preact/hooks";
import { GameCanvas } from "./components/game-canvas";
import { MainMenu, type PlaySession } from "./components/main-menu";
import { UiShowcase } from "./components/ui-showcase";

export function App() {
  const [session, setSession] = useState<PlaySession | null>(null);

  // Dev-only component gallery at #ui
  if (typeof location !== "undefined" && location.hash === "#ui")
    return <UiShowcase />;

  return session ? (
    <GameCanvas session={session} onLeave={() => setSession(null)} />
  ) : (
    <MainMenu onPlay={setSession} />
  );
}
