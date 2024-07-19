import { useState } from "react";
import { useGameContext } from "@/context/game.context";
import Button from "@/components/common/button";
import User from "@/assets/icons/user-solid.svg?react";
import useModal from "@/hooks/use-modal/use-modal";
import playerPreviewBg from "@/assets/player-preview-bg.png";
import styles from "./room-list-actions.module.scss";
import EMOJIS from "@/lib/const/emojis";
import LOBBY_SIZES from "@/lib/const/lobby-size";
import { Input, InputRadio } from "@/components/common/input";

const PlayerSettings: React.FC = () => {
  const { playerSettings, setPlayerSettings } = useGameContext();
  const { Modal, open } = useModal();

  return (
    <>
      <Button variant="secondary" onClick={open}>
        <User />
      </Button>

      <Modal title="Player settings">
        <div className={styles.player__settings}>
          <div className={styles.player__settings__preview}>
            <div className={styles.player__settings__preview__wrapper}>
              <img src={playerPreviewBg} alt="Player preview" />

              <div className={styles.player__settings__preview__content}>
                <p>{playerSettings.name}</p>

                <div>{EMOJIS[playerSettings.emoji]}</div>
              </div>
            </div>
          </div>

          <div className={styles.player__settings__inputs}>
            <Input
              label="Display name"
              placeholder="Funny yellow dog"
              value={playerSettings.name}
              setValue={(val: string) =>
                setPlayerSettings({ ...playerSettings, name: val })
              }
            />

            <InputRadio
              label="Emoji"
              options={EMOJIS}
              value={playerSettings.emoji.toString()}
              setValue={(val: string) =>
                setPlayerSettings({ ...playerSettings, emoji: Number(val) })
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

const CreateLobby: React.FC = () => {
  const [lobbyName, setLobbyName] = useState<string>("");
  const [lobbySize, setLobbySize] = useState<number>(2);

  const { Modal, open } = useModal();

  return (
    <>
      <Button onClick={open}>Create a lobby</Button>

      <Modal title="Creating a lobby">
        <div className={styles.create__lobby}>
          <Input
            label="Lobby name"
            placeholder="The squad is back!"
            value={lobbyName}
            setValue={setLobbyName}
          />

          <InputRadio
            label="Team size"
            options={LOBBY_SIZES}
            value={lobbySize.toString()}
            setValue={(val: string) => setLobbySize(Number(val))}
            grid={2}
          />

          <Button style={{ marginTop: "40px" }}>Create lobby</Button>
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
  return (
    <div className={styles.actions}>
      <CreateLobby />
      <PlayerSettings />
    </div>
  );
};

export default RoomListActions;
