const isSupported = (options) => {
  return !!(
    isBrowser() &&
    isArraySupported() &&
    isFunctionSupported() &&
    isObjectSupported() &&
    isJSONSupported() &&
    isWorkerSupported()
    // isUint8ClampedArraySupported() &&
    // isWebGLSupportedCached(options && options.failIfMajorPerformanceCaveat)
  )
}

const isBrowser = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

const isArraySupported = () => {
  return (
    Array.prototype &&
    Array.prototype.every &&
    Array.prototype.filter &&
    Array.prototype.forEach &&
    Array.prototype.indexOf &&
    Array.prototype.lastIndexOf &&
    Array.prototype.map &&
    Array.prototype.some &&
    Array.prototype.reduce &&
    Array.prototype.reduceRight &&
    Array.isArray
  )
}

const isFunctionSupported = () => {
  return Function.prototype && Function.prototype.bind
}

const isObjectSupported = () => {
  return (
    Object.keys &&
    Object.create &&
    Object.getPrototypeOf &&
    Object.getOwnPropertyNames &&
    Object.isSealed &&
    Object.isFrozen &&
    Object.isExtensible &&
    Object.getOwnPropertyDescriptor &&
    Object.defineProperty &&
    Object.defineProperties &&
    Object.seal &&
    Object.freeze &&
    Object.preventExtensions
  )
}

const isJSONSupported = () => {
  return 'JSON' in window && 'parse' in JSON && 'stringify' in JSON
}

const isWorkerSupported = () => {
  return 'Worker' in window
}

const isUint8ClampedArraySupported = () => {
  return 'Uint8ClampedArray' in window
}

let isWebGLSupportedCache = {}
const isWebGLSupportedCached = (failIfMajorPerformanceCaveat) => {
  if (isWebGLSupportedCache[failIfMajorPerformanceCaveat] === undefined) {
    isWebGLSupportedCache[failIfMajorPerformanceCaveat] = isWebGLSupported(failIfMajorPerformanceCaveat)
  }
  return isWebGLSupportedCache[failIfMajorPerformanceCaveat]
}

isSupported.webGLContextAttributes = {
  antialias: false,
  alpha: true,
  stencil: true,
  depth: true
}

const isWebGLSupported = (failIfMajorPerformanceCaveat) => {
  let canvas = document.createElement('canvas')
  let attributes = Object.create(isSupported.webGLContextAttributes)
  attributes.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat
  if (canvas.probablySupportsContext) {
    return (
      canvas.probablySupportsContext('webgl', attributes) ||
      canvas.probablySupportsContext('experimental-webgl', attributes)
    )
  } else if (canvas.supportsContext) {
    return (
      canvas.supportsContext('webgl', attributes) ||
      canvas.supportsContext('experimental-webgl', attributes)
    )
  } else {
    return (
      canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes)
    )
  }
}

export {
  isSupported,
  isUint8ClampedArraySupported,
  isWebGLSupportedCached
}
