const mix = () => {
  let args = Array.prototype.slice.call(arguments)
  for (let key in args) {
    let mixin = args[key]
    console.info(mixin)
  }
}

export default mix
