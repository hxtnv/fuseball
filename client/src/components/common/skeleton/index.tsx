import styles from "./skeleton.module.scss";

type Props = {
  height?: string;
};

const Skeleton: React.FC<Props> = ({ height }) => {
  return (
    <div
      style={
        height
          ? {
              height,
            }
          : undefined
      }
      className={styles.skeleton}
    />
  );
};

export default Skeleton;
