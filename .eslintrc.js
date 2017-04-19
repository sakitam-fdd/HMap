module.exports = {
  root: true,
  parser: 'babel-eslint',   //使用babel-eslint来作为eslint的解析器
  parserOptions: {      // 设置解析器选项
    sourceType: 'module'    // 表明自己的代码是ECMAScript模块
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',  // 继承eslint-config-standard里面提供的lint规则
  plugins: [    // 使用的插件eslint-plugin-html. 写配置文件的时候，可以省略eslint-plugin-
  ],
  "ecmaFeatures": {
    "globalReturn": true,
    "jsx": true,
    "modules": true
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "document": true,
    "escape": false,
    "navigator": false,
    "unescape": false,
    "window": true,
    "describe": true,
    "before": true,
    "it": true,
    "expect": true,
    "sinon": true
  },
  "rules": {
    "arrow-parens": 0,
    "generator-star-spacing": 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}