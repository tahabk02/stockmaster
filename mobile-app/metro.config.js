const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const { resolver } = config;
config.resolver = {
  ...resolver,
  blockList: [/node_modules[/\\]react-native-safe-area-context[/\\]lib[/\\]/],
  resolveRequest: (context, moduleName, platform) => {
    // Force axios to its browser-compatible build to avoid node-specific builds
    if (moduleName === "axios") {
      return context.resolveRequest(
        context,
        "axios/dist/browser/axios.cjs",
        platform,
      );
    }

    // Force all RNSAC imports to src
    if (moduleName.startsWith("react-native-safe-area-context")) {
      const redirected = moduleName
        .replace(
          "react-native-safe-area-context/lib/module/",
          "react-native-safe-area-context/src/",
        )
        .replace(
          "react-native-safe-area-context/lib/commonjs/",
          "react-native-safe-area-context/src/",
        );

      if (moduleName === "react-native-safe-area-context") {
        return context.resolveRequest(
          context,
          "react-native-safe-area-context/src/index",
          platform,
        );
      }
      return context.resolveRequest(context, redirected, platform);
    }

    // Handle relative imports from within the library
    if (
      context.originModulePath &&
      context.originModulePath.includes("react-native-safe-area-context")
    ) {
      if (moduleName.startsWith("./") || moduleName.startsWith("../")) {
        // If we're already in a context that's being forced to src, this should work.
        // But if origin is in lib (which blockList should prevent, but just in case),
        // we don't want to resolve to lib.
      }
    }

    // Fix socket.io and engine.io resolution in Metro/Expo
    const socketLibs = [
      "socket.io-client",
      "socket.io-parser",
      "engine.io-client",
      "engine.io-parser",
    ];
    if (socketLibs.includes(moduleName)) {
      return context.resolveRequest(
        context,
        `${moduleName}/build/cjs/index.js`,
        platform,
      );
    }

    return context.resolveRequest(context, moduleName, platform);
  },
  extraNodeModules: {
    ...resolver.extraNodeModules,
    three: path.resolve(__dirname, "node_modules/three"),
    "@react-three/fiber": path.resolve(
      __dirname,
      "node_modules/@react-three/fiber",
    ),
    "react-native-safe-area-context": path.resolve(
      __dirname,
      "node_modules/react-native-safe-area-context/src",
    ),
  },
  resolverMainFields: ["react-native", "browser", "main"],
  assetExts: [...resolver.assetExts, "glb", "gltf", "wasm"],
  sourceExts: [...resolver.sourceExts, "mjs", "cjs"],
  unstable_enablePackageExports: false,
};

module.exports = config;
