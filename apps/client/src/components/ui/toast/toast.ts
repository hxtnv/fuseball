import { signal } from "@preact/signals";

export type ToastVariant = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export const toasts = signal<ToastItem[]>([]);

let nextId = 1;
// pending auto-dismiss timers, so manual dismissal can cancel them (no dangling timers)
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export const dismissToast = (id: number): void => {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

const push = (message: string, variant: ToastVariant): void => {
  const id = nextId++;
  toasts.value = [...toasts.value, { id, message, variant }];
  timers.set(
    id,
    setTimeout(() => dismissToast(id), 3500),
  );
};

// fire-and-forget notifications, rendered by <Toaster /> at the app root
export const toast = {
  error: (message: string) => push(message, "error"),
  success: (message: string) => push(message, "success"),
  info: (message: string) => push(message, "info"),
};
