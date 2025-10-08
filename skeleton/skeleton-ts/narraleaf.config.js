const {BuildTarget, WindowsBuildTarget} = require("narraleaf/config");

/**@type {import("narraleaf").ProjectConfig} */
module.exports = {
  build: {
    appId: "com.example.narraleaf",
    copyright: "Copyright © 2025",
    dist: "dist",
    productName: "NarraLeaf Example",
    targets: [
      BuildTarget.Windows({
        target: WindowsBuildTarget.dir,
        icon: "main/assets/app-icon.ico",
      })
    ],
  },
  main: "main/index.ts",
  renderer: {
    baseDir: "renderer",
    allowHTTP: true,
    httpDevServer: true,
  },
  temp: ".narraleaf",
  dev: {
    port: 5050,
  },
  resources: "main/assets",
};