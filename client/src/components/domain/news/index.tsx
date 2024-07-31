import useModal from "@/hooks/use-modal/use-modal";
import styles from "./news.module.scss";
import { Fragment } from "react";
import Button from "@/components/common/button";

type NewsObject = {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
};

type NewsDisplayProps = {
  news: NewsObject;
  divider?: boolean;
};

// todo: in the future, we will have a database for this
const newsList: NewsObject[] = [
  {
    id: "xxxx",
    title: "Fuseball now available on mobile!",
    description:
      "The latest update introduces mobile controls and minor UI improvements to the mobile version. Open it in a browser on your phone and play anywhere!",
    date: "7/31/2024",
    image: "https://pbs.twimg.com/media/GTvHBs4XkAEB6c5?format=jpg&name=medium",
  },
];

const NewsDisplay: React.FC<NewsDisplayProps> = ({ news, divider }) => {
  return (
    <div className={styles.news__content}>
      <h4>{news.title}</h4>

      <p className={styles.news__content__date}>
        Published on <span>{new Date(news.date).toLocaleDateString()}</span>
      </p>

      <a href={news.image} target="_blank" rel="noopener noreferrer">
        <img src={news.image} alt={news.title} />
      </a>

      <p className={styles.news__content__description}>{news.description}</p>

      {divider && <div className={styles.news__content__divider} />}
    </div>
  );
};

const News: React.FC = () => {
  const { open, Modal } = useModal();

  return (
    <Fragment>
      <Modal title="Updates">
        {newsList.map((news, index) => (
          <NewsDisplay
            news={news}
            key={index}
            divider={index < newsList.length - 1}
          />
        ))}
      </Modal>

      <div className={`generic-box`}>
        <NewsDisplay news={newsList[0]} />

        <Button
          variant="secondary"
          size="small"
          onClick={open}
          style={{ marginTop: "10px" }}
        >
          See more updates
        </Button>
      </div>
    </Fragment>
  );
};

export default News;
