import Button from "@/components/common/button";
import solo from "@/assets/solo.png";
import squad from "@/assets/squad.png";
import styles from "./play-cta.module.scss";
import useGameContext from "@/hooks/context/use-game";
import useApiQuery from "@/hooks/use-api-query";
import useGameServerContext from "@/hooks/context/use-game-server";
import { useEffect, useMemo } from "react";
import type { PlayResponse } from "shared/types/api";
import { useNavigate, useLocation } from "react-router-dom";

const PlayCTA: React.FC = () => {
  const { setLobbyId, setPartyId, setPartyType } = useGameContext();
  const { selectedServer } = useGameServerContext();

  const navigate = useNavigate();
  const location = useLocation();

  const gameServerUrl = useMemo(() => {
    return selectedServer?.http ?? "";
  }, [selectedServer]);

  const { refetch, isLoading } = useApiQuery<PlayResponse>(`to-be-filled`, {
    enabled: false,
    method: "POST",
    onSuccess: (data) => {
      navigate(
        data.lobbyId ? "/game" : `/party/${data.partyType}/${data.partyId}`
      );
      setLobbyId(data.lobbyId ?? null);
      setPartyId(data.partyId ?? null);
      setPartyType(data.partyType);
    },
  });

  useEffect(() => {
    if (location.pathname === "/play/solo") {
      refetch(`${gameServerUrl}/play/solo`);
    } else if (location.pathname === "/play/offline") {
      refetch(`${gameServerUrl}/play/offline`);
    }
  }, [location, gameServerUrl, refetch]);

  return (
    <div className={styles.cta}>
      <Button
        style={{ backgroundColor: "#FFB200" }}
        onClick={() => refetch(`${gameServerUrl}/play/solo`)}
        loading={isLoading}
      >
        <img src={solo} alt="Play solo" />
        <span>Play solo</span>
      </Button>

      <Button
        disabled
        style={{ backgroundColor: "#C22631" }}
        onClick={() => refetch(`${gameServerUrl}/play/party`)}
        loading={isLoading}
      >
        <img src={squad} alt="Play with friends" />
        <span>Play with friends</span>
      </Button>

      <Button
        onClick={() => refetch(`${gameServerUrl}/play/offline`)}
        loading={isLoading}
      >
        <span>Practice with bots</span>
      </Button>
    </div>
  );
};

export default PlayCTA;
