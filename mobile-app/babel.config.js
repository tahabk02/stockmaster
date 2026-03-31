module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            'axios': './node_modules/axios/dist/browser/axios.cjs',
            '@react-three/fiber': './node_modules/@react-three/fiber',
            'three': './node_modules/three',
            'react-native-safe-area-context': './node_modules/react-native-safe-area-context/src',
            '^react-native-safe-area-context/(.*)': './node_modules/react-native-safe-area-context/src/\\1',
          },
        },
      ],
    ],
  };
};
