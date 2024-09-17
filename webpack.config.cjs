const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    "nip65-manager": "./src/pages/nip65-manager.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: "svelte-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".svelte"],
  },
};
