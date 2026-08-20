import { useEffect, useState, useRef, useCallback } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import type { WebSocketMessage } from "shared/types/ws";

// Generic type for message handlers with proper typing
type MessageHandler<T = unknown> = (data: T) => void;

// We need this type to handle the internal storage of handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalMessageHandler = MessageHandler<any>;

export type WebSocketHookResult = {
  socket: ReconnectingWebSocket | null;
  isConnected: boolean;
  sendMessage: <T>(type: string, data: T) => void;
  sendRawMessage: (message: string) => void;
  subscribe: <T>(type: string, handler: MessageHandler<T>) => () => void;
  unsubscribe: (type: string, handler: MessageHandler) => void;
};

const useWebsocket = (url: string | undefined): WebSocketHookResult => {
  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to store handlers to avoid re-creating the WebSocket on handler changes
  // We use a specialized internal type for the handlers
  const handlersRef = useRef<Map<string, Set<InternalMessageHandler>>>(
    new Map()
  );

  // Initialize the handlers map if it doesn't exist
  if (!handlersRef.current) {
    handlersRef.current = new Map();
  }

  // Subscribe to a specific message type
  const subscribe = useCallback(
    <T>(type: string, handler: MessageHandler<T>) => {
      if (!handlersRef.current.has(type)) {
        handlersRef.current.set(type, new Set());
      }

      const handlers = handlersRef.current.get(type)!;
      // Cast is safe here because we control how the handler is called
      handlers.add(handler as InternalMessageHandler);

      // Return unsubscribe function
      return () => {
        handlers.delete(handler as InternalMessageHandler);
        if (handlers.size === 0) {
          handlersRef.current.delete(type);
        }
      };
    },
    []
  );

  // Unsubscribe from a specific message type
  const unsubscribe = useCallback(
    <T>(type: string, handler: MessageHandler<T>) => {
      const handlers = handlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler as InternalMessageHandler);
        if (handlers.size === 0) {
          handlersRef.current.delete(type);
        }
      }
    },
    []
  );

  // Send a typed message
  const sendMessage = useCallback(
    <T>(type: string, data: T) => {
      if (socket && socket.readyState === ReconnectingWebSocket.OPEN) {
        const message = JSON.stringify({ type, data });
        socket.send(message);
      }
    },
    [socket]
  );

  // Send a raw message string
  const sendRawMessage = useCallback(
    (message: string) => {
      if (socket && socket.readyState === ReconnectingWebSocket.OPEN) {
        socket.send(message);
      }
    },
    [socket]
  );

  const broadcastToSubscribers = useCallback(
    <T>(type: string, data: T) => {
      const handlers = handlersRef.current.get(type);
      // console.log("Broadcasting to subscribers", type, data, handlers?.size);

      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in handler for message type ${type}:`, error);
          }
        });
      }
    },
    [handlersRef]
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    const ws = new ReconnectingWebSocket(url);
    setSocket(ws);

    ws.onopen = () => {
      setIsConnected(true);

      broadcastToSubscribers("connection", {});
    };

    ws.onclose = () => {
      setIsConnected(false);

      broadcastToSubscribers("disconnection", {});
    };

    // ws.onerror = (event) => {
    //   console.error("WebSocket error:", event);
    // };

    // Handle incoming messages and dispatch to subscribers
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;

        if (message && typeof message === "object" && "type" in message) {
          broadcastToSubscribers(message.type, message.data);
        }
      } catch (error) {
        console.warn("Failed to parse WebSocket message as JSON:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [url, broadcastToSubscribers]);

  return {
    socket,
    isConnected,
    sendMessage,
    sendRawMessage,
    subscribe,
    unsubscribe,
  };
};

export default useWebsocket;
