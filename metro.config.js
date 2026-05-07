const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("glb", "gltf", "bin");

// Force all three.js imports to the same instance (prevents duplicate THREE warning)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "three") {
    return { filePath: require.resolve("three"), type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// NativeWind v4
module.exports = withNativeWind(config, { input: "./global.css" });
