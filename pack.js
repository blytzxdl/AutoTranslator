var webpack = require('webpack')
const path = require("path");
const base = path.join(__dirname);
webpack({
    mode: "production",
    entry: path.resolve(base, "./index.mjs"),
    target: 'node',
    output: {
      filename: "translator.js",
      path: path.resolve(base, "./dist")
    },
    resolve: {
      extensions: [".js", ".jsx",'.json']
    },
}, (err, stats) => {
    // console.log(stats);
    if (err) {
        console.log(err)
    }
})