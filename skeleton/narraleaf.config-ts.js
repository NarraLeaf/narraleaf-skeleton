const {BuildTarget, WindowsBuildTarget} = require("narraleaf");

module.exports = {
  renderer: {
    baseDir: "./renderer"
  },
  main: "./main/index.js",
  build: {
    appId: "com.example.app",
    targets: [
      BuildTarget.Windows({
        target: WindowsBuildTarget.dir,
        icon: "assets/app-icon.ico",
      })
    ]
  },
  resources: "assets"
};
