import { marked } from "marked";
import { cn } from "@/lib/cn";
import styles from "./markdown.module.scss";

interface MarkdownProps {
  children: string;
  class?: string;
}

// Renders trusted, hand-authored Markdown (news). NOT for untrusted user input.
export const Markdown = ({ children, class: cls }: MarkdownProps) => (
  <div
    class={cn(styles.markdown, cls)}
    dangerouslySetInnerHTML={{ __html: marked.parse(children) as string }}
  />
);
