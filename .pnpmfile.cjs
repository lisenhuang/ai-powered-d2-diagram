/**
 * pnpmfile hooks let us tweak dependencies during installation.
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === "@terrastruct/d2") {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies["@terrastruct/wasm"] = "link:vendor/terrastruct-wasm";
      }
      return pkg;
    },
  },
};
