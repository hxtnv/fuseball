import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { dismissToast, toasts, type ToastVariant } from "./toast";
import styles from "./toast.module.scss";

const ICON: Record<ToastVariant, typeof Info> = {
  error: TriangleAlert,
  success: CheckCircle2,
  info: Info,
};

export const Toaster = () => (
  <div class={styles.toaster}>
    {toasts.value.map((t) => {
      const Icon = ICON[t.variant];
      return (
        <div key={t.id} class={cn(styles.toast, styles[`toast--${t.variant}`])}>
          <Icon size={18} class={styles.toast__icon} />
          <span class={styles.toast__msg}>{t.message}</span>
          <button
            class={styles.toast__close}
            title="Dismiss"
            onClick={() => dismissToast(t.id)}
          >
            <X size={14} />
          </button>
        </div>
      );
    })}
  </div>
);
