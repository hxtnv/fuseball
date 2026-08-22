import { useState } from "preact/hooks";
import { GameCanvas } from "@/views/game";
import { MainMenu, type PlaySession } from "@/views/menu";
import { UiShowcase } from "@/views/ui-showcase";

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
