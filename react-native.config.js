module.exports = {
  dependencies: {
    "react-native-sqlite-storage": {
      platforms: {
        android: {
          sourceDir:
            "../node_modules/react-native-sqlite-storage/platforms/android-native",
          packageImportPath: "import io.liteglue.SQLiteStoragePackage;",
          packageInstance: "new SQLiteStoragePackage()",
        },
      },
    },
  },
};
