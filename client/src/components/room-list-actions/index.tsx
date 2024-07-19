import { useGameContext } from "@/context/game.context";
import Button from "@/components/common/button";
// import Cog from "@/assets/icons/cog-solid.svg?react";
import User from "@/assets/icons/user-solid.svg?react";
import useModal from "@/hooks/use-modal/use-modal";
import playerPreviewBg from "@/assets/player-preview-bg.png";
import styles from "./room-list-actions.module.scss";
import EMOJIS from "@/lib/const/emojis";
import { Input, InputRadio } from "../common/input";

const PlayerSettings: React.FC = () => {
  const { playerSettings, setPlayerSettings } = useGameContext();
  const { Modal: PlayerSettingsModal, open: openPlayerSettingsModal } =
    useModal();

  return (
    <>
      <Button variant="secondary" onClick={openPlayerSettingsModal}>
        <User />
      </Button>

      <PlayerSettingsModal title="Player settings">
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
      </PlayerSettingsModal>
    </>
  );
};

const RoomListActions: React.FC = () => {
  // const { lobbies } = useGameContext();

  return (
    <div className={styles.actions}>
      <Button disabled={false}>Create a lobby</Button>

      <PlayerSettings />
      {/* <Button variant="secondary">
        <Cog />
      </Button> */}
    </div>
  );
};

export default RoomListActions;
