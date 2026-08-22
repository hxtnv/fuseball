import { Modal } from "@/components/ui";
import { MOCK_NEWS } from "../../mock";
import styles from "./news-modal.module.scss";

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewsModal = ({ open, onClose }: NewsModalProps) => (
  <Modal open={open} onClose={onClose} width={480} title={{ text: "News" }}>
    <div class={styles.newsModal}>
      {MOCK_NEWS.map((item) => (
        <div class={styles.newsModal__item} key={item.title}>
          <div class={styles.newsModal__item__title}>{item.title}</div>
          <div class={styles.newsModal__item__date}>{item.date}</div>
          <div class={styles.newsModal__item__body}>{item.body}</div>
        </div>
      ))}
    </div>
  </Modal>
);
