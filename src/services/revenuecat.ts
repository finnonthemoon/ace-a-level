import { Platform } from "react-native";
import Purchases from "react-native-purchases";

import { PRODUCT } from "@/product/config";

export const REVENUECAT_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() ||
  PRODUCT.defaultEntitlementId;

function publicApiKey() {
  if (__DEV__) return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY?.trim();
  if (Platform.OS === "ios") return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();
  if (Platform.OS === "android") return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
  return null;
}

export async function configureRevenueCat(appUserId?: string) {
  if (Platform.OS === "web") return false;
  const apiKey = publicApiKey();
  if (!apiKey) return false;

  Purchases.configure({ apiKey, appUserID: appUserId });
  return true;
}
