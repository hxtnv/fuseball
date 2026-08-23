import { BookOpen } from "lucide-react";
import { Button, Markdown, Modal } from "@/components/ui";
import { formatNewsDate, useNews } from "../../hooks/use-news";
import styles from "./news-modal.module.scss";

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewsModal = ({ open, onClose }: NewsModalProps) => {
  // full preview of the latest post; the blog (all posts) comes later
  const { news, status } = useNews(1);
  const post = news[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title={{ text: post?.title ?? "News" }}
    >
      <div class={styles.newsModal}>
        {status === "error" && (
          <div class={styles.newsModal__empty}>Couldn't load news.</div>
        )}
        {status === "ready" && !post && (
          <div class={styles.newsModal__empty}>No news yet.</div>
        )}

        {post && (
          <>
            {post.image && (
              <img class={styles.newsModal__image} src={post.image} alt="" />
            )}
            <div class={styles.newsModal__date}>
              {formatNewsDate(post.createdAt)}
            </div>
            <Markdown class={styles.newsModal__body}>
              {post.description}
            </Markdown>
          </>
        )}

        <div class={styles.newsModal__footer}>
          <Button
            block
            variant="secondary"
            iconSize={18}
            icon={<BookOpen />}
            onClick={() => window.open("/blog", "_blank")}
          >
            Read all posts on the blog
          </Button>
        </div>
      </div>
    </Modal>
  );
};
