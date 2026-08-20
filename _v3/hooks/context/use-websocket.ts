import { useContext } from "react";
import { WebSocketContext } from "@/context/websocket-context";

const useWebSocketContext = () => useContext(WebSocketContext);

export default useWebSocketContext;
