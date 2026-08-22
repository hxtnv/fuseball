type ClassValue = string | number | false | null | undefined;

/** Join truthy class names into a single string (tiny clsx replacement). */
export const cn = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(" ");
