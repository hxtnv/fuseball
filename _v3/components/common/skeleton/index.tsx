import styles from "./skeleton.module.scss";

type Props = {
  style?: React.CSSProperties;
};

const Skeleton: React.FC<Props> = ({ style }) => {
  return <div style={style} className={`${styles.skeleton} generic-box`} />;
};

export default Skeleton;
