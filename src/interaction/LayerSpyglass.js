import { ol } from '../constants'

ol.interaction.LayerSpyglass = function (params) {
  this.options = params || {}
  /**
   * 当前地图对象
   */
  this.map = this.getMap()
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

ol.inherits(ol.interaction.LayerSpyglass, ol.interaction.Interaction)

/**
 * 事件处理
 */
ol.interaction.LayerSpyglass.prototype.activate = function () {
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
ol.interaction.LayerSpyglass.prototype.renderTool = function () {
  // 在渲染之前处理渲染图层
  this.imagery.on('precompose', event => {
    let [ctx, pixelRatio] = [event.context, event.frameState.pixelRatio]
    ctx.save()
    ctx.beginPath()
    if (this.mousePosition) {
      ctx.arc(this.mousePosition[0] * pixelRatio, this.mousePosition[1] * pixelRatio,
        this.radius * pixelRatio, 0, 2 * Math.PI)
      ctx.lineWidth = 5 * pixelRatio
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.stroke()
    }
    ctx.clip()
  })

  this.imagery.on('postcompose', event => {
    let ctx = event.context
    ctx.restore()
  })
}
