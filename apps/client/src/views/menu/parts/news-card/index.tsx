import { Box, Button } from "@/components/ui";
import { MOCK_NEWS } from "../../mock";
import styles from "./news-card.module.scss";

interface NewsCardProps {
  onViewAll: () => void;
}

export const NewsCard = ({ onViewAll }: NewsCardProps) => {
  const latest = MOCK_NEWS[0];
  if (!latest) return null;

  return (
    <Box class={styles.newsCard} flush>
      <img class={styles.newsCard__image} src="/news-placeholder.png" alt="" />
      <div class={styles.newsCard__body}>
        <span class={styles.newsCard__body__tag}>Latest News</span>
        <div class={styles.newsCard__body__title}>{latest.title}</div>
        <div class={styles.newsCard__body__date}>{latest.date}</div>
        <div class={styles.newsCard__body__text}>{latest.body}</div>
        <Button
          block
          variant="secondary"
          size="small"
          class={styles.newsCard__body__action}
          onClick={onViewAll}
        >
          View all news
        </Button>
      </div>
    </Box>
  );
};
