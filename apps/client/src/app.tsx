import { useState } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { GameCanvas } from "@/views/game";
import { MainMenu, type PlaySession } from "@/views/menu";
import { UiShowcase } from "@/views/ui-showcase";
import { usePresence } from "@/lib/presence";

// code-split so non-admins never download the analytics page
const AdminPage = lazy(() =>
  import("@/views/admin").then((m) => ({ default: m.AdminPage })),
);

export function App() {
  const [session, setSession] = useState<PlaySession | null>(null);
  // one persistent presence socket for the whole app session (menu + game)
  const online = usePresence();

  // Dev-only component gallery at #ui
  if (typeof location !== "undefined" && location.hash === "#ui")
    return <UiShowcase />;

  // admin analytics at /admin (auth is enforced by the API)
  if (typeof location !== "undefined" && location.pathname === "/admin")
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    );

  return session ? (
    <GameCanvas session={session} onLeave={() => setSession(null)} />
  ) : (
    <MainMenu onPlay={setSession} online={online} />
  );
}
