import { useContext } from "react";
import { GameContext } from "@/context/game-context";

const useGameContext = () => useContext(GameContext);

export default useGameContext;
