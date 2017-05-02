const mix = (...mixins) => {
  class Mix {}
  // 以编程方式给Mix类添加

  // mixins的所有方法和访问器
  for (let key in mixins) {
    let mixin = mixins[key]
    copyProperties(Mix, mixin)
    copyProperties(Mix.prototype, mixin.prototype)
  }
  return Mix
}

const copyProperties = (target, source) => {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name' && key !== 'length') {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

export default mix

