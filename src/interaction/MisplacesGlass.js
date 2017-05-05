import { ol } from '../constants'

class MisplacesGlass {
  constructor (params) {
    this.options = params || {}
    /**
     * 当前地图对象
     */
    if (this.options.map && this.options.map instanceof ol.Map) {
      this.map = this.options.map
    } else {
      throw new Error('缺少地图对象！')
    }
    /**
     * 当前地图容器
     */
    this.container = this.map.getTargetElement()
    /**
     * 当前滤镜图层
     */
    this.imagery = this.options['imagery']
    /**
     * 当前鼠标位置
     * @type {null}
     */
    this.mousePosition = null
    /**
     * 当前滤镜半径
     * @type {number}
     */
    this.radius = 0

    this.activate()
  }

  /**
   * 激活工具
   */
  activate () {
    this.container.addEventListener('mousemove', event => {
      this.mousePosition = this.map.getEventPixel(event)
      this.map.render()
    })

    this.container.addEventListener('mouseout', () => {
      this.map.render()
    })

    document.addEventListener('keydown', evt => {
      if (evt.which === 38) {
        this.radius = Math.min(this.radius + 5, 150)
        this.map.render()
        evt.preventDefault()
      } else if (evt.which === 40) {
        this.radius = Math.max(this.radius - 5, 25)
        this.map.render()
        evt.preventDefault()
      }
    })

    this.renderTool()
  }

  /**
   * 渲染工具
   */
  renderTool () {
    this.imagery.on('postcompose', event => {
      if (this.mousePosition) {
        let context = event.context
        let pixelRatio = event.frameState.pixelRatio
        let half = this.radius * pixelRatio
        let centerX = this.mousePosition[0] * pixelRatio
        let centerY = this.mousePosition[1] * pixelRatio
        let originX = centerX - half
        let originY = centerY - half
        let size = 2 * half + 1
        let sourceData = context.getImageData(originX, originY, size, size).data
        let dest = context.createImageData(size, size)
        let destData = dest.data
        for (let j = 0; j < size; ++j) {
          for (let i = 0; i < size; ++i) {
            let dI = i - half
            let dJ = j - half
            let dist = Math.sqrt(dI * dI + dJ * dJ)
            let sourceI = i
            let sourceJ = j
            if (dist < half) {
              sourceI = Math.round(half + dI / 2)
              sourceJ = Math.round(half + dJ / 2)
            }
            let destOffset = (j * size + i) * 4
            let sourceOffset = (sourceJ * size + sourceI) * 4
            destData[destOffset] = sourceData[sourceOffset]
            destData[destOffset + 1] = sourceData[sourceOffset + 1]
            destData[destOffset + 2] = sourceData[sourceOffset + 2]
            destData[destOffset + 3] = sourceData[sourceOffset + 3]
          }
        }
        context.beginPath()
        context.arc(centerX, centerY, half, 0, 2 * Math.PI)
        context.lineWidth = 3 * pixelRatio
        context.strokeStyle = 'rgba(255,255,255,0.5)'
        context.putImageData(dest, originX, originY)
        context.stroke()
        context.restore()
      }
    })
  }

  /**
   * 销毁事件
   */
  destroy () {
    console.log('destroying')
  }

  /**
   * 设置当前地图对象
   * @param map
   */
  setMap (map) {
    if (map && map instanceof ol.Map) {
      this.map = map
    }
  }

  /**
   * 返回当前地图对象
   * @returns {ol.Map}
   */
  getMap () {
    return this.map
  }
}

export default MisplacesGlass
