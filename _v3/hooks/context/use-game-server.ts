import { useContext } from "react";
import { GameServerContext } from "@/context/game-server-context";

const useGameServerContext = () => useContext(GameServerContext);

export default useGameServerContext;
