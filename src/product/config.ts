export const PRODUCT = {
  id: "ace-a-level",
  name: "Ace A Level",
  qualificationId: "a-level",
  storageNamespace: "@ace-a-level",
  urlScheme: "acealevel",
  defaultEntitlementId: "Ace A Level Pro",
} as const;

export function storageKey(path: string) {
  return `${PRODUCT.storageNamespace}/${path.replace(/^\/+/, "")}`;
}
