import { useEffect, useMemo, useState } from "react";
import { useGameContext } from "@/context/game.context";
import Button from "@/components/common/button";
import User from "@/assets/icons/user-solid.svg?react";
import DiceFiveSolid from "@/assets/icons/dice-five-solid.svg?react";
import useModal from "@/hooks/use-modal/use-modal";
import playerPreviewBg from "@/assets/player-preview-bg.png";
import styles from "./lobby-list-actions.module.scss";
import EMOJIS from "@/lib/const/emojis";
import LOBBY_SIZES from "@/lib/const/lobby-size";
import { Input, InputRadio } from "@/components/common/input";
import getEmoji from "@/lib/helpers/get-emoji";
import { useWebSocket } from "@/context/websocket.context";
import getRandomPlayerName from "@/lib/helpers/get-random-player-name";
import emitter from "@/lib/emitter";
import Switcher from "@/components/common/switcher";
import TEAM_COLORS from "@/lib/const/team-colors";
import TEAM_NAMES from "@/lib/const/team-names";

type Props = {
  disabled: boolean;
};

const PlayerSettingsModal: React.FC<Props> = ({ disabled }) => {
  const [teamPreview, setTeamPreview] = useState<string>("red");
  const { playerData } = useWebSocket();
  const { Modal, open } = useModal();

  return (
    <>
      <Button variant="secondary" disabled={disabled} onClick={open}>
        <User />
      </Button>

      <Modal title="Player settings">
        <div className={styles.player__settings}>
          <div className={styles.player__settings__inputs}>
            <Input
              label="Display name"
              placeholder="Funny yellow dog"
              value={playerData.name}
              setValue={(val: string) =>
                console.log({ ...playerData, name: val })
              }
              extraIcon={<DiceFiveSolid />}
              extraIconOnClick={() =>
                console.log({
                  ...playerData,
                  name: getRandomPlayerName(),
                })
              }
            />

            <InputRadio
              label="Emoji"
              options={EMOJIS}
              value={playerData.emoji.toString()}
              setValue={(val: string) =>
                console.log({ ...playerData, emoji: Number(val) })
              }
            />
          </div>

          <div className={styles.player__settings__preview}>
            <div className={styles.player__settings__preview__wrapper}>
              <img src={playerPreviewBg} alt="Player preview" />

              <div className={styles.player__settings__preview__content}>
                <p
                  style={{ color: TEAM_COLORS[teamPreview === "red" ? 0 : 1] }}
                >
                  {playerData.name}
                </p>

                <div>{getEmoji(playerData.emoji)}</div>
              </div>

              <div className={styles.player__settings__preview__actions}>
                <Switcher
                  value={teamPreview}
                  setValue={setTeamPreview}
                  style={{ marginTop: "20px" }}
                  options={[
                    {
                      label: `Team ${TEAM_NAMES[0]}`,
                      key: "red",
                      color: TEAM_COLORS[0],
                    },
                    {
                      label: `Team ${TEAM_NAMES[1]}`,
                      key: "blue",
                      color: TEAM_COLORS[1],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const CreateLobbyModal: React.FC<Props> = ({ disabled }) => {
  const [lobbyName, setLobbyName] = useState<string>("A Fuseball game");
  const [lobbySize, setLobbySize] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { Modal, open, close } = useModal({ onClose: () => setError("") });
  const { createLobby } = useGameContext();

  const create = () => {
    setLoading(true);

    createLobby({
      name: lobbyName,
      teamSize: lobbySize + 1,
    });
  };

  const onError = ({ data }: { data: string }) => {
    setError(data);
    setLoading(false);
  };

  const onSuccess = () => {
    setLoading(false);
    close();
  };

  useEffect(() => {
    emitter.on("ws:message:create-lobby-error", onError);
    emitter.on("ws:message:create-lobby-success", onSuccess);

    return () => {
      emitter.off("ws:message:create-lobby-error", onError);
      emitter.off("ws:message:create-lobby-success", onSuccess);
    };
  }, []);

  return (
    <>
      <Button onClick={open} disabled={disabled}>
        Create a lobby
      </Button>

      <Modal title="Creating a lobby">
        <div className={styles.create__lobby}>
          <Input
            label="Lobby name"
            placeholder="The squad is back!"
            value={lobbyName}
            setValue={setLobbyName}
            maxLength={40}
          />

          <InputRadio
            label="Team size"
            options={LOBBY_SIZES}
            value={lobbySize.toString()}
            setValue={(val: string) => setLobbySize(Number(val))}
            grid={2}
          />

          <div style={{ marginTop: "30px", width: "100%" }} />

          {error !== "" && (
            <p className={styles.create__lobby__error}>{error}</p>
          )}

          <Button onClick={create} loading={loading}>
            Create lobby
          </Button>

          <p className={styles.create__lobby__info}>
            After creating the lobby, the game will open in warmup mode until
            atleast one other player joins the lobby.
          </p>
        </div>
      </Modal>
    </>
  );
};

const RoomListActions: React.FC = () => {
  const { status } = useWebSocket();
  const modalsDisabled = useMemo(() => status !== "connected", [status]);

  return (
    <div className={styles.actions}>
      <CreateLobbyModal disabled={modalsDisabled} />
      <PlayerSettingsModal disabled={modalsDisabled} />
    </div>
  );
};

export default RoomListActions;
