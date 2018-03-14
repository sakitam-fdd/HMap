const copyProperties = (target, source) => {
  for (let key of Object.getOwnPropertyNames(source)) {
    if (!key.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

const mixin = (childCtor, ...mixins) => {
  // 以编程方式给Mix类添加mixin的所有方法和访问器
  for (let key in mixins) {
    let mixin = mixins[key]
    copyProperties(childCtor, mixin)
    copyProperties(childCtor.prototype, mixin.prototype)
  }
}

export default mixin
