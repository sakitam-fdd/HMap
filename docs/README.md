# 在项目中学习大概路线

## 1. 初步了解怎么加载公司地图
> * 关于配置（`mapConfig.js`）
> * 地图类型（公司地图是按xyz金字塔结构切片，天地图是支持WMTS标准）
```ecmascript 6
// 公司地图
    let tileUrl = options.tileUrl;
    let tileGrid = new ol.tilegrid.TileGrid({
      tileSize: that.tileSize,
      origin: that.origin,
      extent: that.fullExtent,
      resolutions: that.resolutions
    });
    let urlTemplate = tileUrl + '/tile/{z}/{y}/{x}';
    let tileArcGISXYZ = new ol.source.XYZ({
      wrapX: false,
      tileGrid: tileGrid,
      projection: that.projection,
      tileUrlFunction: function (tileCoord) {
        let url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
          .replace('{x}', tileCoord[1].toString())
          .replace('{y}', (-tileCoord[2] - 1).toString());
        return url
      }
    });
    let baseLayer = new ol.layer.Tile({
      isBaseLayer: true,
      isCurrentBaseLayer: true,
      layerName: options.layerName,
      source: tileArcGISXYZ
    });
    
// WMTS 标准加载方式

    initTDTLayer (layerConfig) {
    let projection = ol.proj.get('EPSG:4326');
    let size = ol.extent.getWidth(projection.getExtent()) / 256;
    let resolutions = new Array(19);
    let matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }
    let layer = new ol.layer.Tile({
      isBaseLayer: true,
      isCurrentBaseLayer: false,
      layerName: layerConfig['layerName'],
      opacity: 1,
      visible: false,
      source: new ol.source.WMTS({
        url: layerConfig['layerUrl'],
        layer: layerConfig['layer'],
        matrixSet: 'c',
        format: 'tiles',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(this.projection.getExtent()),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: false
      })
    });
    return layer;
  };
```

> * 地图初始化流程，视图交互，控制器添加
```ecmascript 6
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      interactions: ol.interaction.defaults({
        doubleClickZoom: true,
        keyboard: false
      }).extend([new app.Drag()]),
      controls: [new ol.control.ScaleLine({
        target: 'hdscalebar'
      }), new ol.control.Loading()],
      layers: [baseLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(options.center, that.projection),
        zoom: options.zoom,
        projection: that.projection,
        extent: that.fullExtent,
        maxResolution: that._resolutions[4],
        minResolution: that._resolutions[18]
      })
    })
```

> * 要素添加（怎么创建要素，geometry数据标准，应该添加到什么图层上）
```ecmascript 6
//例如：创建点要素包含（空间数据处理，属性数据处理，样式处理，图层管理）
   addPoint (attr, params) {
    if (!this.map) return;
    let geometry = null, id = null;
    if (!params) {
      params = {};
    }
    /**空间数据处理**/
    if (attr instanceof ol.geom.Geometry) {
      geometry = attr;
    } else if ($.isArray(attr.geometry)) {
      geometry = new ol.geom.Point(attr.geometry);
    } else {
      geometry = new ol.format.WKT().readGeometry(attr.geometry);
    }
    let iconFeature = new ol.Feature({
      geometry: geometry,
      params: params
    });
    /***样式处理**/
    let featureType = params.featureType;
    let imgURL = null;
    if ((attr['attributes'] && attr['attributes']['imgSrc']) || attr['imgSrc']) {
      imgURL = attr['imgSrc'] ? attr['imgSrc'] : attr['attributes']['imgSrc'];
    } else if (params['imgSrc']) {
      imgURL = params['imgSrc'];
    } else if (featureType) {
      imgURL = config.markConfig.getMarkConfigByType(featureType).imgURL;
    } else {
      imgURL = config.markConfig.getDefaultMrakConfig().imgURL;
    }
    let iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 25],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: imgURL
      })
    });
    iconFeature.setStyle(iconStyle);
    /**属性数据处理**/
    if (params['id'] || (attr['attributes'] && attr['attributes']['id'])){
      id = params['id'] ? params['id'] : attr['attributes']['id'];
      iconFeature.setId(id)
    }
    /**图层管理**/
    if (params['layerName']) {
      let layer = this.getTempVectorLayer(params.layerName, {
        create: true
      });
      layer.getSource().addFeature(iconFeature);
      this.pointLayers.add(params.layerName)
    } else {
      this.tempVectorLayer.getSource().addFeature(iconFeature);
    }
    return iconFeature;
  }
```

> * 要素移除（1. 可以直接移除要素 2. 可以移除要素所在图层（等于移除这个图层的所有要素））
```ecmascript 6
   /**
   * 通过layerName移除要素
   * @param layerName
   */
  removeFeatureByLayerName (layerName) {
    if (this.map) {
      if (this.plotEdit && this.plotEdit.activePlot) {
        this.plotEdit.deactivate();
      }
      let layers = this.map.getLayers();
      layers.forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
          if (layer.get('layerName') === layerName && layer.getSource() && layer.getSource().clear) {
            layer.getSource().clear();
          }
        }
      })
    }
  }
  
    /**
     * 移除当前feature
     * @param featuer
     */
    removeFeature (featuer) {
      if (!this.map) return;
      if (featuer instanceof ol.Feature) {
        let tragetLayer = this.getLayerByFeatuer(featuer);
        if (tragetLayer) {
          if (this.plotEdit && this.plotEdit.activePlot && this.plotEdit.activePlot === featuer) {
            this.plotEdit.deactivate();
          }
          let source = tragetLayer.getSource();
          if (source && source.removeFeature) {
            source.removeFeature(featuer);
            this.cursor_ = 'pointer'
            let ele = this.map.getTargetElement()
            ele.firstElementChild.style.cursor = 'default';
            ele.style.cursor = 'default';
          }
        }
      } else {
        console.info("传入的不是要素");
      }
    }
```