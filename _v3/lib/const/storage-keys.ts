export const StorageKeys = {
  JWT: "fuseball:jwt",
} as const;

export type StorageKeysType = typeof StorageKeys;
export default StorageKeys;
