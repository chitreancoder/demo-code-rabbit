module.exports = {
  plugins: ["syntax-dynamic-import"],
  presets: [
    [
      "@babel/preset-env",
      {
        modules: process.env.NODE_ENV === "test" ? "commonjs" : false
      }
    ]
  ]
};

