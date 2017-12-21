// form https://github.com/Viglino/OL3-AnimatedCluster/blob/gh-pages/layer/animatedclusterlayer.js

import ol from 'openlayers'

class AnimatedClusterLayer extends ol.layer.Vector {
  constructor (options = {}) {
    super(options)
    this.oldcluster = new ol.source.Vector()
    this.clusters = []
    this.animation = {start: false}
    this.set('animationDuration', typeof (options.animationDuration) === 'number' ? options.animationDuration : 700)
    this.set('animationMethod', options.animationMethod || ol.easing.easeOut)
    // Save cluster before change
    this.getSource().on('change', this.saveCluster, this)
    // Animate the cluster
    this.on('precompose', this.animate, this)
    this.on('postcompose', this.postanimate, this)
  }

  /**
   * save old cluster
   */
  saveCluster () {
    this.oldcluster.clear()
    if (!this.get('animationDuration')) return
    const features = this.getSource().getFeatures()
    if (features.length && features[0].get('features')) {
      this.oldcluster.addFeatures(this.clusters)
      this.clusters = features.slice(0)
      this.sourceChanged = true
    }
  }

  /**
   * Get the cluster that contains a feature
   * @param feature
   * @param cluster
   * @returns {*}
   */
  getClusterForFeature (feature, cluster) {
    for (let j = 0; j < cluster.length; j++) {
      const features = cluster[j].get('features')
      if (features && features.length) {
        for (let k = 0; k < features.length; k++) {
          if (feature === features[k]) {
            return cluster[j]
          }
        }
      }
    }
    return false
  }

  /**
   * stop animation
   */
  stopAnimation () {
    this.animation.start = false
    this.animation.cA = []
    this.animation.cB = []
  }

  /**
   * animate the cluster
   * @param event
   */
  animate (event) {
    const duration = this.get('animationDuration')
    if (!duration) return
    const resolution = event.frameState.viewState.resolution
    const a = this.animation
    let time = event.frameState.time
    // Start a new animation, if change resolution and source has changed
    if (a.resolution !== resolution && this.sourceChanged) {
      let extent = event.frameState.extent
      if (a.resolution < resolution) {
        extent = ol.extent.buffer(extent, 100 * resolution)
        a.cA = this.oldcluster.getFeaturesInExtent(extent)
        a.cB = this.getSource().getFeaturesInExtent(extent)
        a.revers = false
      } else {
        extent = ol.extent.buffer(extent, 100 * resolution)
        a.cA = this.getSource().getFeaturesInExtent(extent)
        a.cB = this.oldcluster.getFeaturesInExtent(extent)
        a.revers = true
      }
      a.clusters = []
      for (let i = 0; i < a.cA.length; i++) {
        let c0 = a.cA[i]
        let f = c0.get('features')
        if (f && f.length) {
          const c = this.getClusterForFeature(f[0], a.cB)
          if (c) a.clusters.push({f: c0, pt: c.getGeometry().getCoordinates()})
        }
      }
      // Save state
      a.resolution = resolution
      this.sourceChanged = false
      // No cluster or too much to animate
      if (!a.clusters.length || a.clusters.length > 1000) {
        this.stopAnimation()
        return
      }
      // Start animation from now
      time = a.start = (new Date()).getTime()
    }

    // Run animation
    if (a.start) {
      let vectorContext = event.vectorContext
      let d = (time - a.start) / duration
      // Animation ends
      if (d > 1.0) {
        this.stopAnimation()
        d = 1
      }
      d = this.get('animationMethod')(d)
      // Animate
      const style = this.getStyle()
      let stylefn = (typeof (style) === 'function') ? style : style.length ? function () {
        return style
      } : function () {
        return [style]
      }
      // Layer opacity
      event.context.save()
      event.context.globalAlpha = this.getOpacity()
      // Retina device
      const ratio = event.frameState.pixelRatio
      for (let i = 0; i < a.clusters.length; i++) {
        let c = a.clusters[i]
        let pt = c.f.getGeometry().getCoordinates()
        if (a.revers) {
          pt[0] = c.pt[0] + d * (pt[0] - c.pt[0])
          pt[1] = c.pt[1] + d * (pt[1] - c.pt[1])
        } else {
          pt[0] = pt[0] + d * (c.pt[0] - pt[0])
          pt[1] = pt[1] + d * (c.pt[1] - pt[1])
        }
        // Draw feature
        let st = stylefn(c.f, resolution)
        /* Preserve pixel ration on retina */
        let geo = new ol.geom.Point(pt)
        for (let k = 0; k < st.length; k++) {
          let [sc, s] = [null, st[k]]
          // OL < v4.3 : setImageStyle doesn't check retina
          const imgs = ol.Map.prototype.getFeaturesAtPixel ? false : s.getImage()
          if (imgs) {
            sc = imgs.getScale()
            imgs.setScale(sc * ratio)
          }
          // OL3 > v3.14
          if (vectorContext.setStyle) {
            vectorContext.setStyle(s)
            vectorContext.drawGeometry(geo)
          } else {
            vectorContext.setImageStyle(imgs)
            vectorContext.setTextStyle(s.getText())
            vectorContext.drawPointGeometry(geo)
          }
          if (imgs) imgs.setScale(sc)
        }
      }
      event.context.restore()
      // tell OL3 to continue postcompose animation
      event.frameState.animate = true
      // Prevent layer drawing (clip with null rect)
      event.context.save()
      event.context.beginPath()
      event.context.rect(0, 0, 0, 0)
      event.context.clip()
      this.clip_ = true
    }
    return this
  }

  /**
   * remove clipping after the layer is drawn
   * @param event
   */
  postanimate (event) {
    if (this.clip_) {
      event.context.restore()
      this.clip_ = false
    }
  }
}
ol.layer.AnimatedCluster = AnimatedClusterLayer
export default AnimatedClusterLayer
