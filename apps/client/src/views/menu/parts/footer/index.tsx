import { GAME_VERSION } from "@fuseball/shared";
import { Button } from "@/components/ui";
import styles from "./footer.module.scss";

export const Footer = () => (
  <div class={styles.footer}>
    <div class={styles.footer__social}>
      <a
        href="https://twitter.com/fuseball_game"
        target="_blank"
        rel="noreferrer"
        title="Twitter"
      >
        <Button block variant="secondary">
          <img src="/icons/social/twitter.png" alt="Twitter" />
        </Button>
      </a>

      <a
        href="https://discord.gg/B8Pp9nrpdD"
        target="_blank"
        rel="noreferrer"
        title="Discord"
      >
        <Button block variant="secondary">
          <img src="/icons/social/discord.png" alt="Discord" />
        </Button>
      </a>
    </div>

    <div class={styles.footer__meta}>
      <a
        class={styles.footer__meta__link}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        Privacy Policy
      </a>
      <a
        class={styles.footer__meta__link}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        Terms of Service
      </a>
      <span class={styles.footer__meta__version}>v{GAME_VERSION}</span>
    </div>
  </div>
);
