// import Navbar from "@/components/domain/navbar";
// import Sidebar from "@/components/domain/sidebar";
// import Home from "@/views/home";
import WebSocketProvider from "@/context/websocket";
import GameProvider from "@/context/game";
import GameServerProvider from "@/context/game-server";
import AuthProvider from "@/context/auth";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <GameProvider>
          <GameServerProvider>{children}</GameServerProvider>
        </GameProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};

// const AppInner = () => {
//   return (
//     <>
//       <Navbar />
//       <Sidebar />
//       <Home />
//     </>
//   );
// };

export default App;
