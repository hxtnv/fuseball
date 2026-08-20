import Button from "@/components/common/button";
import styles from "./socials.module.scss";
import TwitterIcon from "@/assets/icons/twitter-brands-solid.svg?react";
import Discord from "@/assets/icons/discord-brands-solid.svg?react";
// import Instagram from "@/assets/icons/instagram-brands-solid.svg?react";
import Tiktok from "@/assets/icons/tiktok-brands-solid.svg?react";
import SOCIALS from "@/lib/const/socials";

const list = [
  {
    title: "Twitter",
    icon: TwitterIcon,
    link: SOCIALS.TWITTER,
    color: "#1DA1F2",
  },
  { title: "Discord", icon: Discord, link: SOCIALS.DISCORD, color: "#5865F2" },
  //   {
  //     title: "Instagram",
  //     icon: Instagram,
  //     link: SOCIALS.INSTAGRAM,
  //     color: "#E1306C",
  //   },
  { title: "Tiktok", icon: Tiktok, link: SOCIALS.INSTAGRAM, color: "#fe2858" },
];

const Socials = () => {
  return (
    <div className={styles.socials}>
      {list.map((item) => (
        <a
          href={item.link}
          key={item.title}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button style={{ backgroundColor: item.color }}>
            <item.icon />
          </Button>
        </a>
      ))}
    </div>
  );
};

export default Socials;
