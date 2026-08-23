import { Box, Button } from "@/components/ui";
import { formatNewsDate, useNews } from "../../hooks/use-news";
import styles from "./news-card.module.scss";

interface NewsCardProps {
  onViewAll: () => void;
}

export const NewsCard = ({ onViewAll }: NewsCardProps) => {
  const { news, status } = useNews(1);
  const latest = news[0];
  if (status !== "ready" || !latest) return null;

  return (
    <Box class={styles.newsCard} flush>
      <img
        class={styles.newsCard__image}
        src={latest.image ?? "/news-placeholder.png"}
        alt=""
      />
      <div class={styles.newsCard__body}>
        {/* <span class={styles.newsCard__body__tag}>Latest News</span> */}
        <div class={styles.newsCard__body__title}>{latest.title}</div>
        <div class={styles.newsCard__body__date}>
          {formatNewsDate(latest.createdAt)}
        </div>
        <div class={styles.newsCard__body__text}>{latest.excerpt}</div>
        <Button
          block
          variant="secondary"
          size="small"
          class={styles.newsCard__body__action}
          onClick={onViewAll}
        >
          Read more
        </Button>
      </div>
    </Box>
  );
};
