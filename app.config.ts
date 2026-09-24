import type { ConfigContext, ExpoConfig } from "expo/config";

const GOOGLE_PLUGIN = "@react-native-google-signin/google-signin";
const LOCALIZATION_PLUGIN = "expo-localization";
const GOOGLE_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

function googleIosUrlScheme() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  if (!clientId) return null;

  if (!clientId.endsWith(GOOGLE_CLIENT_ID_SUFFIX)) {
    throw new Error(
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com.",
    );
  }

  return `com.googleusercontent.apps.${clientId.slice(
    0,
    -GOOGLE_CLIENT_ID_SUFFIX.length,
  )}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = googleIosUrlScheme();
  const plugins = (config.plugins ?? []).filter((plugin) =>
    Array.isArray(plugin) ? plugin[0] !== GOOGLE_PLUGIN : plugin !== GOOGLE_PLUGIN,
  );

  if (!plugins.some((plugin) =>
    Array.isArray(plugin)
      ? plugin[0] === LOCALIZATION_PLUGIN
      : plugin === LOCALIZATION_PLUGIN,
  )) {
    plugins.push(LOCALIZATION_PLUGIN);
  }

  if (iosUrlScheme) {
    plugins.push([GOOGLE_PLUGIN, { iosUrlScheme }]);
  }

  return {
    ...config,
    plugins,
  } as ExpoConfig;
};
