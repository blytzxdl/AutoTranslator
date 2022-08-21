var webpack = require('webpack')
const path = require("path");
const base = path.join(__dirname);
// console.log(webpack);
webpack({
    mode: "production",
    entry: path.resolve(base, "./index.js"),
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