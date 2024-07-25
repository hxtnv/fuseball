import { LobbyLive } from "../../../types/lobby";

const updateChatMsgs = (lobby: LobbyLive) => {
  const now = Date.now();

  Object.keys(lobby.chatMessages).forEach((playerId) => {
    const message = lobby.chatMessages[playerId];

    if (!message) {
      return;
    }

    if (now - message.timestamp > 5000) {
      delete lobby.chatMessages[playerId];
      return;
    }
  });
};

export default updateChatMsgs;
