import ol from 'openlayers'

class SelectCluster extends ol.interaction.Select {
  constructor (options) {
    super(options)
    this.pointRadius = options.pointRadius || 12
    this.circleMaxObjects = options.circleMaxObjects || 10
    this.maxObjects = options.maxObjects || 60
    this.spiral = (options.spiral !== false)
    this.animate = options.animate
    this.animationDuration = options.animationDuration || 500
    this.selectCluster_ = (options.selectCluster !== false)
    // Create a new overlay layer for
    const overlay = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: new ol.Collection(),
        useSpatialIndex: true
      }),
      name: 'Cluster overlay',
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      displayInLayerSwitcher: false,
      style: options.featureStyle
    })
    this.overlayLayer_ = overlay
    if (options.layers) {
      if (typeof (options.layers) === 'function') {
        const fn = options.layers
        options.layers = function (layer) {
          return (layer === overlay || fn(layer))
        }
      } else if (options.layers.push) {
        options.layers.push(this.overlayLayer_)
      }
    }
    if (options.filter) {
      const fn = options.filter
      options.filter = function (f, l) {
        if (!l && f.get('selectclusterlink')) return false
        else return fn(f, l)
      }
    } else {
      options.filter = function (f, l) {
        if (!l && f.get('selectclusterlink')) return false
        else return true
      }
    }
    this.filter_ = options.filter
    this.on('select', this.selectCluster, this)
  }

  /**
   * Clear the selection, close the cluster and remove revealed features
   */
  clear () {
    this.getFeatures().clear()
    this.overlayLayer_.getSource().clear()
  }

  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param map
   */
  setMap (map) {
    if (this.getMap()) {
      if (this.getMap().getView()) {
        this.getMap().getView().un('change:resolution', this.clear, this)
      }
      this.getMap().removeLayer(this.overlayLayer_)
    }

    // Add overlay before the select to appeare underneath
    this.overlayLayer_.setMap(map)
    ol.interaction.Select.prototype.setMap.call(this, map)
    if (map && map.getView()) {
      map.getView().on('change:resolution', this.clear, this)
    }
  }

  /**
   * get layer
   * @returns {ol.layer.Vector|*}
   */
  getLayer () {
    return this.overlayLayer_
  }

  /**
   * Select a cluster
   * @param e
   */
  selectCluster (e) {
    if (!e.selected.length) {
      this.clear()
      return
    }
    // Get selection
    const feature = e.selected[0]
    // It's one of ours
    if (feature.get('selectclusterfeature')) return
    // Clic out of the cluster => close it
    const source = this.overlayLayer_.getSource()
    source.clear()
    const cluster = feature.get('features')
    // Not a cluster (or just one feature)
    if (!cluster || cluster.length === 1) return
    // Remove cluster from selection
    if (!this.selectCluster_) this.getFeatures().clear()
    const center = feature.getGeometry().getCoordinates()
    // Pixel size in map unit
    const pix = this.getMap().getView().getResolution()
    let r = pix * this.pointRadius * (0.5 + cluster.length / 4)
    // Draw on a circle
    if (!this.spiral || cluster.length <= this.circleMaxObjects) {
      let max = Math.min(cluster.length, this.circleMaxObjects)
      for (let i = 0; i < max; i++) {
        let a = 2 * Math.PI * i / max
        if (max === 2 || max === 4) a += Math.PI / 4
        let p = [center[0] + r * Math.sin(a), center[1] + r * Math.cos(a)]
        let cf = new ol.Feature({'selectclusterfeature': true, 'features': [cluster[i]], geometry: new ol.geom.Point(p)})
        cf.setStyle(cluster[i].getStyle())
        source.addFeature(cf)
        let lk = new ol.Feature({'selectclusterlink': true, geometry: new ol.geom.LineString([center, p])})
        source.addFeature(lk)
      }
    } else {
      let [a, r, d] = [0, null, 2 * this.pointRadius]
      let max = Math.min(this.maxObjects, cluster.length)
      // Feature on a spiral
      for (let i = 0; i < max; i++) {
        r = d / 2 + d * a / (2 * Math.PI)
        // Angle
        a = a + (d + 0.1) / r
        let dx = pix * r * Math.sin(a)
        let dy = pix * r * Math.cos(a)
        let p = [center[0] + dx, center[1] + dy]
        let cf = new ol.Feature({'selectclusterfeature': true, 'features': [cluster[i]], geometry: new ol.geom.Point(p)})
        cf.setStyle(cluster[i].getStyle())
        source.addFeature(cf)
        let lk = new ol.Feature({'selectclusterlink': true, geometry: new ol.geom.LineString([center, p])})
        source.addFeature(lk)
      }
    }
    if (this.animate) this.animateCluster_(center)
  }

  /**
   * Animate the cluster and spread out the features
   * @param center
   * @private
   */
  animateCluster_ (center) {
    if (this.listenerKey_) {
      this.overlayLayer_.setVisible(true)
      ol.Observable.unByKey(this.listenerKey_)
    }
    // Features to animate
    let features = this.overlayLayer_.getSource().getFeatures()
    if (!features.length) return
    this.overlayLayer_.setVisible(false)
    let style = this.overlayLayer_.getStyle()
    let stylefn = (typeof (style) === 'function') ? style : style.length ? function () {
      return style
    } : function () {
      return [style]
    }
    let duration = this.animationDuration || 500
    let start = new Date().getTime()
    // Animate function
    function animate (event) {
      let vectorContext = event.vectorContext
      // Retina device
      let ratio = event.frameState.pixelRatio
      let res = event.target.getView().getResolution()
      let e = ol.easing.easeOut((event.frameState.time - start) / duration)
      for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        if (feature.get('features')) {
          let feature = features[i]
          let pt = feature.getGeometry().getCoordinates()
          pt[0] = center[0] + e * (pt[0] - center[0])
          pt[1] = center[1] + e * (pt[1] - center[1])
          let geo = new ol.geom.Point(pt)
          // Image style
          let st = stylefn(feature, res)
          for (let s = 0; s < st.length; s++) {
            let sc
            // OL < v4.3 : setImageStyle doesn't check retina
            let imgs = ol.Map.prototype.getFeaturesAtPixel ? false : st[s].getImage()
            if (imgs) {
              sc = imgs.getScale()
              imgs.setScale(ratio)
            }
            // OL3 > v3.14
            if (vectorContext.setStyle) {
              vectorContext.setStyle(st[s])
              vectorContext.drawGeometry(geo)
            } else {
              vectorContext.setImageStyle(imgs)
              vectorContext.drawPointGeometry(geo)
            }
            if (imgs) imgs.setScale(sc)
          }
        }
      }
      // Stop animation and restore cluster visibility
      if (e > 1.0) {
        ol.Observable.unByKey(this.listenerKey_)
        this.overlayLayer_.setVisible(true)
        this.overlayLayer_.changed()
        return
      }
      // tell OL3 to continue postcompose animation
      event.frameState.animate = true
    }
    // Start a new postcompose animation
    this.listenerKey_ = this.getMap().on('postcompose', animate, this)
  }
}

ol.interaction.SelectCluster = SelectCluster

export default SelectCluster
