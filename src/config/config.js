const config = {
  interactions: {
    altShiftDragRotate: true,
    doubleClickZoom: true,
    keyboard: true,
    mouseWheelZoom: true,
    shiftDragZoom: true,
    dragPan: true,
    pinchRotate: true,
    pinchZoom: true,
    zoomDelta: 5, // 缩放增量（默认一级）
    zoomDuration: 5 // 缩放持续时间
  },
  controls: {
    attribution: true,
    attributionOptions: {
      className: 'ol-attribution', // Default
      target: 'attributionTarget'
    },
    rotate: true,
    rotateOptions: {
      className: 'ol-rotate', // Default
      target: 'rotateTarget'
    },
    zoom: true,
    zoomOptions: {
      className: 'ol-zoom', // Default
      target: 'zoomTarget'
    },
    overViewMapVisible: false,
    scaleLineVisible: true
  },
  view: {
    center: [0, 0],
    // constrainRotation: false, // 旋转角度约束
    enableRotation: true, // 是否允许旋转
    extent: [],
    // maxResolution: 0, // 非必须参数
    // minResolution: 0,
    // maxZoom: 19,
    // minZoom: 0,
    projection: 'EPSG:3857',
    resolutions: [],
    rotation: 0,
    resolution: '',
    zoom: 0, // resolution
    zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
  },
  logo: {}
}

export default config
