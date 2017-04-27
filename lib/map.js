export default class HDMap {

  constructor () {
    /**
     * 地图工具
     * @type {{addPoint: boolean, ljQuery: boolean, iQuery: boolean, drawPlot: boolean, toolsType: {addPoint: string, ljQuery: string, iQuery: string, drawPlot: string}}}
     */
    this.mapTools = {
      addPoint: false, ljQuery: false,
      iQuery: false, drawPlot: false,
      addTextArea: false, drawBox: false,
      addMaker: false, panoTool: false,
      toolsType: {
        addPoint: 'addPoint',
        ljQuery: 'ljQuery',
        iQuery: 'iQuery',
        drawPlot: 'drawPlot',
        addTextArea: 'addTextArea',
        drawBox: 'drawBox',
        addMaker: 'addMaker',
        panoTool: 'panoTool'
      }
    };
    this.addPointHandlerClick = null;
    this.plotDraw = null;//标绘工具
    this.plotEdit = null;
    this._lastDrawInteractionGeometry = null;
    this.wgs84Sphere = new ol.Sphere(6378137);
    /**
     * 当前地图线要素
     * @type {Array}
     */
    this.currentMapLines = [];
    /**
     * 当前地图点要素
     * @type {Array}
     */
    this.currentMapPoints = [];
    /**
     * 当前地图线图层
     * @type {Array}
     */
    this.lineLayers = [];
    /**
     * 当前地图点图层
     * @type {Array}
     */
    this.pointLayers = [];
    /**
     * 当前地图面图层
     * @type {Array}
     */
    this.polygonLayers = [];
    /**
     * 周边搜索要素
     * @type {null}
     */
    this.circleSerachFeat = null;
    /**
     * 当前地图气泡
     * @type {null}
     */
    this.popupOverlay = null;
    /**
     * draw工具
     * @type {null}
     */
    this.draw = null;
    /**
     * 公用临时图层
     * @type {null}
     */
    this.tempVectorLayer = null;
    /**
     * 鼠标移动的上一次坐标
     * @type {null}
     */
    this.lastCoor = null;
    /**
     * 实景关联提示
     * @type {null}
     */
    this.panoLable = null;
    /**
     * 用于处理地图加载完成事件的定时器
     * @type {null}
     * @private
     */
    this.timer_ = null;
  }

  /**
   * 获取地图参数
   * @param mapDiv
   * @param params
   */
  getMapParams (mapDiv, params) {
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      $.ajax({
        url: params['layerUrl'] + '?f=pjson',
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function (data) {
          if (data) {
            let res = {
              projection: data.spatialReference.wkid,
              fullExtent: [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax],
              origin: [data.tileInfo.origin.x, data.tileInfo.origin.y],
              tileSize: data.tileInfo.cols,
              lods: data.tileInfo.lods,
              tileUrl: params['layerUrl'],
              center: params['center'],
              zoom: params['zoom'],
              config: params['config'],
              layerName: params['layerName']
            };
            that.initMap(mapDiv, res);
            resolve(res);
          } else {
            reject(data);
          }
        }
      });
    });
  }

  /**
   * 初始化当前地图
   * @param mapDiv
   * @param params
   */
  initMap (mapDiv, params) {
    let options = params || {};
    let that = this;
    /**
     * 投影
     * @type {ol.proj.Projection}
     */
    this.projection = ol.proj.get('EPSG:' + options.projection);
    /**
     * 显示范围
     */
    this.fullExtent = options.fullExtent;
    /**
     * 投影范围
     */
    this.projection.setExtent(this.fullExtent);
    /**
     * 瓦片原点
     */
    this.origin = options.origin;
    /**
     * 瓦片大小
     */
    this.tileSize = options.tileSize;
    /**
     * 分辨率
     * @type {Array}
     */
    this.resolutions = [];
    let len = options.lods.length;
    for (let i = 0; i < len; i++) {
      this.resolutions.push(options.lods[i].resolution)
    }
    /**
     * 定义渲染参数
     */
    let size = ol.extent.getWidth(this.projection.getExtent()) / 256;
    /**
     * 渲染分辨率
     * @type {Array}
     * @private
     */
    this._resolutions = new Array(19);
    /**
     * 层级
     * @type {Array}
     */
    this.matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
      this._resolutions[z] = size / Math.pow(2, z);
      this.matrixIds[z] = z
    }
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
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      interactions: ol.interaction.defaults({
        doubleClickZoom: true,
        keyboard: false
      }).extend([new app.Drag()]),
      controls: [
        new ol.control.ScaleLine(),
        new ol.control.Loading()
      ],
      layers: [baseLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(options.center, that.projection),
        zoom: options.zoom,
        projection: that.projection,
        extent: that.fullExtent,
        maxResolution: that._resolutions[2],
        minResolution: that._resolutions[18]
      })
    })
    this.tempVectorLayer = this.getTempVectorLayer(config.tempLayer.tempVectorLayer, {
      create: true
    })
    // this.addVectorLabel();
    this.addEvent();
    // this.addImageBaseLayer();
    this.addTileArcGISRest(config.mapConfig.baseLayers[1]);
  }

  /**
   * 地图加载完成事件（超时时间120s）
   * @returns {Promise}
   */
  onMapInit () {
    let that = this;
    let start = new Date().getTime();
    return new Promise((resolve) => {
      if (that.map){
        resolve(true);
      } else {
        let cc = 0;
        window.clearInterval(that.timer_);
        that.timer_ = null;
        that.timer_ = window.setInterval(() => {
          let end = new Date().getTime();
          cc = ((end - start) / 1000);
          if (that.map && cc <= 120) {
            resolve(true);
            window.clearInterval(that.timer_);
            that.timer_ = null;
          }
          if (cc > 120 && !that.map) {
            resolve(false);
            window.clearInterval(that.timer_);
            that.timer_ = null;
          }
        }, 50)
      }
    })
  }

  /**
   * 添加吸附交互
   * @param layer
   */
  addSnapInteraction (layer, feature, pixelTolerance) {
    let snap = new ol.interaction.Snap({
      source: layer.getSource(),
      features: ((feature && feature instanceof ol.Feature) ? feature : undefined),
      edge: true,
      vertex: true,
      pixelTolerance: (!!pixelTolerance ? pixelTolerance : 10)
    });
    if (this.map && snap) {
      this.map.addInteraction(snap)
    }
  }

  addTileArcGISRest (layerConfig) {
    if (layerConfig === undefined || layerConfig['layerName'] === undefined) {
      console.info("未配置此地图");
      return null;
    }
    let tileUrl = layerConfig.layerUrl;
    let tileGrid = new ol.tilegrid.TileGrid({
      tileSize: this.tileSize,
      origin: this.origin,
      extent: this.fullExtent,
      resolutions: this.resolutions
    });
    let urlTemplate = tileUrl + '/tile/{z}/{y}/{x}';
    let tileArcGISXYZ = new ol.source.XYZ({
      wrapX: false,
      tileGrid: tileGrid,
      projection: this.projection,
      tileUrlFunction: function (tileCoord) {
        let url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
          .replace('{x}', tileCoord[1].toString())
          .replace('{y}', (-tileCoord[2] - 1).toString());
        return url
      }
    });
    let baseLayer = new ol.layer.Tile({
      isBaseLayer: true,
      visible: false,
      isCurrentBaseLayer: true,
      layerName: layerConfig.layerName,
      source: tileArcGISXYZ
    });
    // this.map.addLayer(baseLayer)
    this.map.getLayers().insertAt(1, baseLayer);
  }

  addVectorLabel () {
    let layerConfig = this.getLayerConfigByName('vectorLabel');
    if (layerConfig === undefined || layerConfig['layerName'] === undefined) {
      console.info("未配置此地图");
      return null;
    }
    let tileUrl = layerConfig.layerUrl;
    let tileGrid = new ol.tilegrid.TileGrid({
      tileSize: this.tileSize,
      origin: this.origin,
      extent: this.fullExtent,
      resolutions: this.resolutions
    });
    let urlTemplate = tileUrl + '/tile/{z}/{y}/{x}';
    let tileArcGISXYZ = new ol.source.XYZ({
      wrapX: false,
      tileGrid: tileGrid,
      projection: this.projection,
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
      layerName: layerConfig.layerName,
      source: tileArcGISXYZ
    });
    baseLayer.setZIndex(9999);
    this.map.addLayer(baseLayer)
    // this.map.getLayers().insertAt(1, baseLayer);
  }

  /**
   * 获取地图配置
   * @param layerName
   * @returns {Array.<*>}
   */
  getLayerConfigByName (layerName) {
    let baseLayerConfig = config.mapConfig.baseLayers;
    if (config.mapConfig.thematicLayers && config.mapConfig.thematicLayers.length > 0) {
      baseLayerConfig = baseLayerConfig.concat(config.mapConfig.thematicLayers);
    }
    let layer = baseLayerConfig.filter(ele => {
      return layerName === ele['layerName']
    })
    return layer[0];
  }

  /**
   * 初始化天地图
   * @param layerConfig
   * @returns {*}
   */
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
          origin: ol.extent.getTopLeft(projection.getExtent()),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: false
      })
    });
    return layer;
  };
  /**
   * 添加影像地图
   * @returns {null}
   */
  addImageBaseLayer () {
    let layerConfig = this.getLayerConfigByName('earth');
    if (layerConfig === undefined || layerConfig['layerName'] === undefined) {
      console.info("未配置此地图");
      return null;
    }
    let baseLayer = this.initTDTLayer(layerConfig);
    let imglayerConfig = {
      layerName: 'mapMake',
      layer: 'cia',
      layerUrl: 'http://t0.tianditu.cn/cia_c/wmts'
    };
    let imgtitlelayer = this.initTDTLayer(imglayerConfig);
    this.map.getLayers().insertAt(0, baseLayer);
    this.map.getLayers().insertAt(1, imgtitlelayer);
  };
  /**
   * 根据layerNames移除图层
   * @param layerNames
   */
  removeByLayerNames (layerNames) {
    if (!this.map || !layerNames || layerNames.length == 0) return;
    layerNames.forEach(layerName => {
      let layer = this.getLayerByName(layerName)
      if (layer && layer instanceof ol.layer.Vector) {
        layer.getSource().clear()
      } else if (layer && layer instanceof ol.layer.Tile) {
        this.map.removeLayer(layer);
      }
    })
  }
  /**
   * 添加天地图地形图
   * @returns {null}
   */
  addDemBaseLayer () {
    let layerConfig = this.getLayerConfigByName('panorama');
    if (layerConfig === undefined || layerConfig['layerName'] === undefined) {
      console.info('未配置此地图');
      return null;
    }
    let baseLayer = this.initTDTLayer(layerConfig);
    this.map.getLayers().insertAt(0, baseLayer);
  };
  /**
   * 添加天地图
   * @returns {null}
   */
  addTDTerBaseLayer () {
    let layerConfig = this.getLayerConfigByName('天地图');
    if (layerConfig === undefined || layerConfig['layerName'] === undefined) {
      console.info("未配置此地图");
      return null;
    }
    let baseLayer = this.initTDTLayer(layerConfig);
    this.map.getLayers().insertAt(0, baseLayer);
  };

  /**
   * 添加arcgis专题图
   * @param layerName
   */
  loadArcMapService (layerName) {
    if (!this.map) return;
    let layerConfig = this.getLayerConfigByName(layerName)
    if (layerConfig) {
      let params = layerConfig['params']
      let serviceUrl = layerConfig['serviceUrl']
      let source = new ol.source.TileArcGISRest({
        url: serviceUrl,
        params: params,
        wrapX: false
      })
      let layer = new ol.layer.Tile({
        layerName: layerName,
        source: source,
        wrapX: false
      })
      this.map.addLayer(layer)
    } else {
      console.log('请配置相关图层！')
    }
  }
  /**
   * 地图切换
   * @param layerName
   */
  changeBaseLayer (layerName) {
    if (!this.map) return;
    let annotation = this.getLayerByName('mapMake');
    // let vectorLabel = this.getLayerByName('vectorLabel');
    let layers = this.map.getLayers().getArray();
    let baseLayer = layers.filter(layer => {
      if (layer.get('isBaseLayer')) {
        layer.set('isCurrentBaseLayer', false);
        layer.setVisible(false);
      }
      return layer.get('layerName') === layerName
    })[0];
    if (baseLayer) {
      baseLayer.setVisible(true);
      baseLayer.set('isCurrentBaseLayer', true);
      switch (layerName) {
        case 'vector':
          // annotation.setVisible(false);
          // vectorLabel.setVisible(true);
          break;
        case 'earth':
          // annotation.setVisible(true);
          break;
        case 'panorama':
          // annotation.setVisible(true);
          break;
        case '天地图':
          // annotation.setVisible(true);
          break;
      }
    }
  }

  /**
   * 添加地图事件
   */
  addEvent () {
    this.map.on("click", event => {
      window.ObservableObj.dispatchEvent({
        type: 'clickEvent',
        originEvent: event,
        value: null
      });
      if (this.plotDraw && !this.plotDraw.isDrawing()) {
        let feature = this.map.forEachFeatureAtPixel(event.pixel, feature => {
          return feature;
        });
        if (feature && feature.getGeometry().isPlot) {
          this.plotEdit.activate(feature);  // 开始编辑
          window.ObservableObj.dispatchEvent({
            type: 'PlotFeatureEvent',
            originEvent: event,
            value: feature
          });
        } else {
          this.plotEdit.deactivate(); // 结束编辑
        }
      }
    });
    this.map.on('singleclick', event => {
      let feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
      });
      console.log(event.coordinate)
      if (feature) {
        if (!this.plotDraw && !feature.getGeometry().isPlot) {
          window.ObservableObj.dispatchEvent({
            type: 'clickFeatEvent',
            originEvent: event,
            value: feature
          });
        }
      }
    });
    /**
     * 添加移动交互
     */
    this.moveInteraction = new ol.interaction.Select({
      condition: ol.events.condition.pointerMove,
      style: function (fea, resolution) {
        let styles = [];
        let style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#D97363',
            width: 10
          })
        });
        styles.push(style);
        return styles
      },
      layers: function (layer) {
        return layer.get('selectable');
      },
      filter: function (feat, layer) {
        if (feat.get('features')) {
          return feat.get('features').length <= 1;
        }
        return true;
      }
    });

    this.map.addInteraction(this.moveInteraction);

    this.moveInteraction.on('select', event => {
      let ret = event.selected;
      if (ret.length == 0) {
        let deselected = event.deselected;
        if (deselected.length > 0) {
          let feat = deselected[0];
          let layer = feat.get('belongLayer');
          if (layer && (layer.getSource() instanceof ol.source.Cluster)) {
            feat.setStyle(layer.getStyle());
          } else if (feat.get('features')) {
            let feats = feat.get('features');
            if (feats[0]) {
              let _layer = feats[0].get('belongLayer');
              if (feats[0].get('belongLayer')) {
                feat.setStyle(_layer.getStyle()); //selectStyle normalStyle
              }
            }
          } else {
            let _style = feat.get('normalStyle');
            if (_style) {
              feat.setStyle(_style);
            }
          }
          window.currentFeat = null;
          window.ObservableObj.dispatchEvent({
            type: 'mouseOnFeatureEvent',
            originEvent: event,
            value: feat
          });
        }
      } else {
        let feat = ret[0];
        let lastSelectFeature = this.moveInteraction.get('lastSelectFeature');
        if (lastSelectFeature && lastSelectFeature.get('normalStyle')) {
          lastSelectFeature.setStyle(lastSelectFeature.get('normalStyle'));
        }
        this.moveInteraction.set('lastSelectFeature', feat);
        let layer = this.moveInteraction.getLayer(feat);
        let _style = feat.get('selectStyle') || layer.get('selectedStyle');
        if (_style) {
          feat.setStyle(_style);
        }
        if (feat.get('features')) {
          feat = feat.get('features')[0];
        }
        feat.set('belongLayer', layer);
        window.currentFeat = null;
        window.ObservableObj.dispatchEvent({
          type: 'mouseOnFeatureEvent',
          originEvent: event,
          value: feat
        });
      }
    });

    let mapContent = this.map.getTargetElement();
    mapContent.onmousedown = function (ev) {
      if (ev.button == 2) {//鼠标右键
        window.ObservableObj.dispatchEvent({
          type: 'MOUSE_RIGHT',
          originEvent: ev,
          value: ''
        });
      } else if (ev.button == 0) {//鼠标左键
        window.ObservableObj.dispatchEvent({
          type: 'MOUSE_LEFT',
          originEvent: ev,
          value: ''
        });
      }
    };
  }

  /**
   * 放大
   */
  zoomOut () {
    let zoom = this.map.getView().getZoom();
    this.map.getView().setZoom(zoom + 1);
  };
  /**
   * 缩小
   */
  zoomIn () {
    let zoom = this.map.getView().getZoom();
    this.map.getView().setZoom(zoom - 1);
  };

  /**
   * 更新地图大小
   */
  updateMapSize () {
    if (!this.map) return;
    this.map.updateSize();
  }
  /**
   * 全图
   */
  zoomMaxExtent () {
    let projection = this.map.getView().getProjection();
    this.deactiveAll();
    this.map.getView().setCenter(ol.proj.fromLonLat(config.mapConfig.center, projection));
    this.map.getView().setZoom(2);
  };

  /**
   * 获取当前地图叠加图层
   * @param layername
   * @returns {*}
   */
  getLayerByName (layername) {
    let targetLayer = null;
    if (this.map) {
      let layers = this.map.getLayers();
      layers.forEach(function (layer) {
        let layernameTemp = layer.get('layerName');
        if (layernameTemp === layername) {
          targetLayer = layer;
        }
      });
    }
    return targetLayer;
  }

  /**
   * 获取临时图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  getTempVectorLayer (layerName, params) {
    if (!this.map) return;
    let vectorLayer = this.getLayerByName(layerName);
    if (!(vectorLayer instanceof ol.layer.Vector)) {
      vectorLayer = null;
    }
    if (!vectorLayer) {
      if (params && params.create) {
        let vectorSource = new ol.source.Vector({
          wrapX: false
        });
        vectorLayer = new ol.layer.Vector({
          layerName: layerName,
          params: params,
          source: vectorSource,
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(67, 110, 238, 0.4)'
            }),
            stroke: new ol.style.Stroke({
              color: '#4781d9',
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ffcc33'
              })
            })
          })
        });
      }
    }
    if (this.map && vectorLayer && !this.getLayerByName(layerName)) {
      //图层是否可以选择
      if (params && params.hasOwnProperty('selectable')) {
        vectorLayer.set("selectable", params.selectable);
      }
      this.map.addLayer(vectorLayer);
    }
    return vectorLayer;
  }

  /**
   * 工具类
   * @param toolType
   * @param params
   */
  activeTool (toolType, params) {
    if (!this.map) return;
    this.deactiveAll();
    if (this.mapTools.hasOwnProperty(toolType)) {
      this.mapTools[toolType] = true;
      switch (toolType) {
        case this.mapTools.toolsType.addPoint: //添加点
          ol.Observable.unByKey(this.addPointHandlerClick);//移除对key的监听
          this.addPointHandlerClick = this.map.once('singleclick', event => {
            if (this.mapTools.addPoint) {
              this.addPoint({
                geometry: event.coordinate
              }, params);
            }
          });
          break;
        case this.mapTools.toolsType.ljQuery: //路径分析
          this.queryparams = params;
          ol.Observable.unByKey(this.addPointHandlerClick);//移除对key的监听
          this.addPointHandlerClick = this.map.once('singleclick', event => {
            if (this.mapTools.ljQuery) {
              this.addPoint({
                geometry: event.coordinate
              }, params);
            }
          });
          break;
        case this.mapTools.toolsType.drawPlot: //plot
          if (!this.plotEdit) {
            this.plotDraw = new P.PlotDraw(this.map);
            this.plotEdit = new P.PlotEdit(this.map);
            this.plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, event => {
              let feature = event.feature;
              this.setLastDrawInteractionGeometry(feature.getGeometry().clone());
              this.plotEdit.activate(feature);
              this.getTempVectorLayer(params['layerName'], {create: true}).getSource().addFeature(feature);
              window.ObservableObj.dispatchEvent({
                type: 'PlotFeatureEvent',
                originEvent: event,
                value: feature
              });
            }, false, this);
          }
          this.plotEdit.deactivate();
          this.plotDraw.activate(eval(params.plotType), params);
          break;
        case this.mapTools.toolsType.addTextArea: // textArea
          ol.Observable.unByKey(this.addPointHandlerClick);
          this.addPointHandlerClick = this.map.once('singleclick', event => {
            if (this.mapTools.addTextArea) {
              window.ObservableObj.dispatchEvent({
                type: 'singleClickEvent',
                originEvent: event,
                value: null
              });
            }
          });
          break;
        case this.mapTools.toolsType.drawBox: // drawBox
          this.addDrawInteraction('drawBox', params);
          break;
        case this.mapTools.toolsType.iQuery: // iQuery
          ol.Observable.unByKey(this.addPointHandlerClick);
          this.addPointHandlerClick = this.map.once('singleclick', event => {
            if (this.mapTools.iQuery && params && params.drawend) {
              params.drawend(event);
              this.mapTools.iQuery = false;
            }
          });
          break;
        case this.mapTools.toolsType.addMaker: // addMaker
          ol.Observable.unByKey(this.addPointHandlerClick);
          this.addPointHandlerClick = this.map.once('singleclick', event => {
            if (this.mapTools.addMaker) {
              this.showMarkPopup({
                width: "280px",
                height: "200px",
                title: "添加标记",
                showMarkFea: true,
                id: params['id'],
                content: params['content'],
                coordinate: event.coordinate
              })
            }
          });
          break;
        case this.mapTools.toolsType.panoTool: // 实景工具
          ol.Observable.unByKey(this.pointerMoveHandler);
          this.removeOverlayById('pano-sample-popupoverlay');
          if (this.panoLable && this.panoLable instanceof ol.Overlay) {
            this.map.removeOverlay(this.panoLable)
            this.panoLable = null
          }
          ol.Observable.unByKey(this.addPointHandlerClick);
          this.addPointHandlerClick = null;
          this.addPointHandlerClick = this.map.on('singleclick', event => {
            if (this.mapTools.panoTool) {
              window.ObservableObj.dispatchEvent({
                type: 'singleClickEvent',
                originEvent: event,
                value: null
              });
            }
          });
          this.pointerMoveHandler = this.map.on('pointermove', event => {
            let extent = this.getMapCurrentExtent();
            if (ol.extent.containsXY(extent, event.coordinate[0], event.coordinate[1])) {
              this.setPanoIcon(params, event.coordinate)
              params.moveEvent(event);
            } else {
              console.log('出界')
            }
          });
          break
      }
    }

    if (this.mapTools.drawBox) {
      this._activePointInteraction(false);
    } else {
      this._activePointInteraction(true);
    }
  }

  /**
   * 实景eye
   * @param params
   * @param coor
   * @param feat
   */
  setPanoIcon (params, coor) {
    let [ tempStyle , src ] = [ [], ''];
    if (!this.lastCoor) {
      this.lastCoor = coor
    } else {
      if (this.lastCoor[0] > coor[0]) {
        src = params['imgSrc'] + '-center.png'
      } else if (this.lastCoor[0] < coor[0]) {
        src = params['imgSrc'] + '-center.png'
      } else {
        src = params['imgSrc'] + '-center.png'
      }
      this.lastCoor = coor
    }
    if (!src) src = params['imgSrc'] + '-center.png';
    this.addPanoLable(src, coor)
  }

  /**
   * 移除实景工具
   * @param overLayerId
   */
  removePanoTool (overLayerId) {
    this.deactiveAll()
    ol.Observable.unByKey(this.addPointHandlerClick);
    this.addPointHandlerClick = null;
    ol.Observable.unByKey(this.pointerMoveHandler);
    this.pointerMoveHandler = null;
    if (this.panoLable && this.panoLable instanceof ol.Overlay) {
      this.map.removeOverlay(this.panoLable)
      this.panoLable = null
    }
    if (overLayerId) {
      this.closePopupById(overLayerId + 'overlay')
    }
  }
  /**
   * 添加实景eyeLable
   * @param coor
   */
  addPanoLable (src, coor) {
    if (!this.panoLable) {
      let divcontent = document.createElement('div');
      let imgEle = document.createElement('img');
      imgEle.src = src;
      imgEle.style.position = 'absolute';
      imgEle.style.top = '-22px';
      imgEle.style.left = '-32px';
      let helpTooltipElement = document.createElement('label');
      helpTooltipElement.className = " BMapLabel BMap_disLabel";
      helpTooltipElement.style.position = "absolute";
      helpTooltipElement.style.top = '-22px';
      helpTooltipElement.style.left = '0px';
      helpTooltipElement.style.display = "inline";
      helpTooltipElement.style.cursor = "inherit";
      helpTooltipElement.style.border = "1px solid rgb(255, 1, 3)";
      helpTooltipElement.style.padding = "3px 5px";
      helpTooltipElement.style.whiteSpace = "nowrap";
      helpTooltipElement.style.fontVariant = "normal";
      helpTooltipElement.style.fontWeight = "normal";
      helpTooltipElement.style.fontStretch = "normal";
      helpTooltipElement.style.fontSize = "12px";
      helpTooltipElement.style.fontFamily = "arial,simsun";
      helpTooltipElement.style.color = "rgb(51, 51, 51)";
      helpTooltipElement.style.backgroundColor = "rgb(255, 255, 255)";
      helpTooltipElement.style.webkitUserSelect = "none";
      helpTooltipElement.style.height = '15px';
      helpTooltipElement.style.lineHeight = '15px';
      helpTooltipElement.innerHTML = "<span style='color: #7a7a7a;'>右键关闭实景模式</span>";
      divcontent.appendChild(imgEle)
      divcontent.appendChild(helpTooltipElement)
      this.panoLable = new ol.Overlay({
        element: divcontent,
        offset: [15, -20],
        positioning: 'center-center'
      });
      this.map.addOverlay(this.panoLable);
      $(this.panoLable.getElement()).parent('div').css('zIndex', '99999')
    }
    this.panoLable.setPosition(coor);
  }

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   */
  calculatePoint (coor) {
    if (this.map) {
      let extent = this.getMapCurrentExtent();
      if (ol.extent.containsXY(extent, coor[0], coor[1])) {

      }
    }
  };

  /**
   * 添加Draw交互
   * @param drawType
   * @param params
   */
  addDrawInteraction (drawType, params) {
    this.removeDrawInteraion();
    this.draw = this._createDraw(drawType, params);
    this.map.addInteraction(this.draw);
    if (drawType !== 'Point') {
      this.getDragPanInteraction().setActive(false);
    }
    this.draw.on('drawstart', evt => {
      this.drawSketch = evt.feature;
    });
    let drawEndEventName = (drawType === 'drawBox') ? 'boxend' : 'drawend';
    this.draw.on(drawEndEventName, evt => {
      if (this.draw.getGeometry) {
        this.setLastDrawInteractionGemotry(this.draw.getGeometry().clone());
      } else if (this.drawSketch) {
        this.setLastDrawInteractionGemotry(this.drawSketch.getGeometry().clone());
      }
      if (evt.feature) {
        evt.feature.set('params', params);
      }
      this.getDragPanInteraction().setActive(true);
      if (drawEndEventName === 'drawend') {
        this._activePointInteraction(true);
      }
      this.map.getTargetElement().style.cursor = "default";
      if (params && params.drawend) {
        params.drawend(evt);
      }
      this.drawSketch = null;
      if (!params['notclear']) {
        this.removeDrawInteraion();
      }
    });
  }

  /**
   * 激活point交互工具
   * @param b
   * @private
   */
  _activePointInteraction (b) {
    let interactions = this.map.getInteractions();
    if (b) {
      let hasAppDrag = false;
      let tempInteractions = interactions.getArray();
      let length = tempInteractions.length;
      for (let m = 0; m < length; m++) {
        let tempInteraction = tempInteractions[m];
        if (tempInteraction && tempInteraction.customType && tempInteraction.customType === 'appDrag') {
          hasAppDrag = true;
          break;
        }
      }
      if (!hasAppDrag) {
        this.map.addInteraction(new app.Drag());
      }
    } else {
      let tempInteractions = interactions.getArray();
      let length = tempInteractions.length;
      for (let m = 0; m < length; m++) {
        let tempInteraction = tempInteractions[m];
        if (tempInteraction && tempInteraction.customType && tempInteraction.customType === 'appDrag') {
          this.map.removeInteraction(tempInteraction);
          tempInteraction = null;
          break;
        }
      }
    }
  };

  /**
   * 获取拖拽交互
   * @returns {ol.interaction.DragPan|*}
   * @private
   */
  getDragPanInteraction () {
    if (!this.dragPanInteraction) {
      let items = this.map.getInteractions().getArray();
      items.forEach( item => {
        if (item && item instanceof ol.interaction.DragPan) {
          this.dragPanInteraction = item;
        }
      });
    }
    return this.dragPanInteraction;
  };

  /**
   * 设置交互空间数据
   * @param geometry
   */
  setLastDrawInteractionGemotry (geometry) {
    if (geometry instanceof ol.geom.Geometry) {
      this._lastDrawInteractionGemotry = geometry;
    } else {
      console.error(geometry, '不是几何对象');
    }
  };

  /**
   * 获取交互空间数据
   * @returns {ol.geom.Geometry|*}
   */
  getLastDrawInteractionGemotry () {
    return this._lastDrawInteractionGemotry;
  };

  /**
   * 创建画笔工具
   * @param drawType
   * @param params
   * @returns {*}
   * @private
   */
  _createDraw (drawType, params) {
    if (!params) {
      params = {};
    }
    let fill = {color: 'rgba(254, 164, 164, 1)'};
    let stroke = {color: 'rgba(252, 129, 129, 1)', width: 3};
    let image = {radius: 1, fill: new ol.style.Fill({color: '#ffcc33'})};
    if (!params.layerName) {
      params.layerName = config.tempLayer.tempVectorLayer;
    }
    if (!params.fill) {
      params.fill = fill;
    }
    if (!params.stroke) {
      params.stroke = stroke;
    }
    if (!params.image) {
      params.image = image;
    }
    let draw = null;
    if (drawType == 'drawBox') {
      draw = new ol.interaction.DragBox({
        className: 'ol-dragbox'
      });
    } else {
      draw = new ol.interaction.Draw({
        source: this.getTempVectorLayer(params.layerName, {create: true}).getSource(),
        type: drawType,
        style: new ol.style.Style({
          fill: new ol.style.Fill(params.fill),
          stroke: new ol.style.Stroke(params.stroke),
          image: new ol.style.Circle(params.image)
        })
      });
    }
    return draw;
  };

  /**
   * 获取最后绘制空间信息
   * @returns {ol.geom.Geometry|*|null}
   */
  getLastDrawInteractionGeometry () {
    if (!this.map) return;
    return this._lastDrawInteractionGeometry;
  };

  /**
   * 设置最后绘制空间信息
   * @param geometry
   */
  setLastDrawInteractionGeometry (geometry) {
    if (!this.map) return;
    if (geometry instanceof ol.geom.Geometry) {
      this._lastDrawInteractionGeometry = geometry;
    } else {
      console.error(geometry, "不是几何对象");
    }
  }

  /**
   * 取消所有工具的激活
   */
  deactiveAll () {
    if (!this.map) return;
    for (let key in this.mapTools) {
      if (typeof this.mapTools[key] == 'boolean')
        this.mapTools[key] = false;
    }
    this.removeDrawInteraion();
  }

  /**
   * 移除绘制交互
   */
  removeDrawInteraion () {
    if (!this.map) return;
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }
    delete this.draw;
    this.draw = null;
  }

  /**
   * 添加单个点
   * @param attr
   * @param params
   * @returns {ol.Feature}
   */
  addPoint (attr, params) {
    if (!this.map) return;
    let geometry = null, id = null;
    if (!params) {
      params = {};
    }
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

    if (params['id'] || (attr['attributes'] && attr['attributes']['id'])){
      id = params['id'] ? params['id'] : attr['attributes']['id'];
      if (attr['attributes']) {
        iconFeature.setProperties(attr.attributes);
      }
      iconFeature.setId(id)
    }
    if (params['layerName']) {
      let layer = this.getTempVectorLayer(params.layerName, {
        create: true
      });
      layer.getSource().addFeature(iconFeature);
      this.pointLayers.push(params.layerName)
    } else {
      this.tempVectorLayer.getSource().addFeature(iconFeature);
    }
    if (params.drawend && typeof(params.drawend) == "function") {
      params.drawend({
        feature: iconFeature
      });
    }
    if (this.addPointHandlerClick) {
      ol.Observable.unByKey(this.addPointHandlerClick);//移除对key的监听
    }
    this.deactiveAll(); //取消激活所有工具
    this.OrderLayerZindex();
    if (params.hasOwnProperty('disZoomToExtent') && params['disZoomToExtent']) {
    } else {
      this.MovePointToView(geometry.getCoordinates());
    }
    return iconFeature;
  }

  /**
   * 添加实景eye
   * @param attr
   * @param params
   * @returns {ol.Feature}
   */
  addPanoeye (coor, params) {
    if (!this.map) return;
    let [ geometry, id ] = [ (new ol.geom.Point(coor)), '' ];
    if (!params) {
      params = {};
    }
    let iconFeature = new ol.Feature({
      geometry: geometry,
      params: params
    });
    let imgURL = params['imgSrc'];
    let iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        // size: ['28', '28'],
        opacity: 0.75,
        src: imgURL
      })
    });
    iconFeature.setStyle(iconStyle);
    if (params['id']) {
      id = params['id'];
      iconFeature.setId(id)
    }
    if (params['layerName']) {
      let layer = this.getTempVectorLayer(params.layerName, {
        create: true
      });
      layer.getSource().addFeature(iconFeature);
      this.pointLayers.push(params.layerName)
    } else {
      this.tempVectorLayer.getSource().addFeature(iconFeature);
    }
    this.OrderLayerZindex();
    this.MovePointToView(geometry.getCoordinates());
    return iconFeature;
  }

  /**
   * 按类型添加点
   * @param array
   * @param drawType
   * @param params
   * @returns {*}
   */
  addTypePoints (array, drawType, params) {
    if (!this.map) return;
    if (!params) params = {};
    if (params['isClear']) {
      this.clearGraphics();
    }
    if (!array || array.length == 0) {
      return false
    }

    let multiPoint = new ol.geom.MultiPoint([]);
    let addedPoints = [];
    for (let i = 0; i < array.length; i++) {
      let attr = array[i], geometry = null, imgSrcHover, imgSrc;

      if (!attr) {
        continue;
      }
      if (!attr.geometry) {
        continue;
      }
      if (attr instanceof ol.geom.Geometry) {
        geometry = attr;
      } else if ($.isArray(attr.geometry)) {
        geometry = new ol.geom.Point(attr.geometry);
      } else {
        geometry = new ol.format.WKT().readGeometry(attr.geometry);
      }

      let feature = new ol.Feature({
        geometry: geometry
      });
      multiPoint.appendPoint(geometry);
      //设置标识参数
      if (params) {
        feature.set("params", params);
        if (params['layerName']) {
          feature.set("layerName", params.layerName);
        }
      }
      if (!attr['attributes']) {
        attr['attributes'] = {};
      }
      if (attr.attributes['ID'] || attr.attributes['id']) {
        feature.setId(attr.attributes['ID'] ? attr.attributes['ID'] : attr.attributes['id']);
        feature.setProperties(attr.attributes);
      } else {
        console.info("传入的数据缺少id");
        continue;
      }
      //样式
      if (attr.attributes['imgSrc']) {
        imgSrc = attr.attributes.imgSrc;
        if (attr.attributes['imgSrcHover']) {
          imgSrcHover = attr.attributes["imgSrcHover"];
        } else {
          imgSrcHover = attr.attributes.imgSrc;
        }
      } else if (params['featureType']) {
        imgSrc = config.markConfig.getMarkConfigByType(params['featureType']).imgSrc;
        imgSrcHover = config.markConfig.getMarkConfigByType(params['featureType']).imgSrcHover;
        if (!imgSrcHover) {
          imgSrcHover = imgSrc;
        }
      } else {
        imgSrc = config.markConfig.getDefaultMrakConfig().imgSrc;
        imgSrcHover = config.markConfig.getDefaultMrakConfig().imgSrcHover;
      }
      let selectStyle, normalStyle;
      if (params['orderBy']) {
        selectStyle = new ol.style.Style({
          image: new ol.style.Icon({//标绘点的样式
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: imgSrc
          }),
          text: new ol.style.Text({
            text: i + 1 + "",
            offsetX: 0.5,
            offsetY: -18,
            fill: new ol.style.Fill({
              color: "#fff"
            })
          })
        });
        normalStyle = new ol.style.Style({
          image: new ol.style.Icon({//标绘点选中的样式
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: imgSrcHover
          }),
          text: new ol.style.Text({
            text: i + 1 + "",
            offsetX: 0.5,
            offsetY: -18,
            fill: new ol.style.Fill({
              color: "#fff"
            })
          })
        });
      } else {
        selectStyle = new ol.style.Style({
          image: new ol.style.Icon({//标绘点的样式
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: imgSrcHover
          })
        });
        normalStyle = new ol.style.Style({
          image: new ol.style.Icon({//标绘点选中的样式
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: imgSrc
          })
        });
      }
      //是否存储样式
      if (params['showStyle']) {
        feature.set('normalStyle', normalStyle);
        feature.set('selectStyle', selectStyle);
      }
      if (normalStyle != null) {
        feature.setStyle(normalStyle);//设置样式
      }
      if (drawType && drawType == "overlay") {
        this.addTypeOverlay(feature, attr['attributes'], params, i);
      } else {
        if (params['layerName']) {
          let layer = this.getTempVectorLayer(params.layerName, {
            create: true
          });
          layer.getSource().addFeature(feature);
          this.pointLayers.push(params.layerName);
        } else {
          this.tempVectorLayer.getSource().addFeature(feature);
        }
      }
    }
    if (!params['disZoomToExtent']) {
      this._getExtent(multiPoint);
    }
    this.OrderLayerZindex();
    return addedPoints;
  }

  /**
   * 字体图标标绘
   * @param feature
   * @param attributes
   * @param params
   * @param i
   */
  addTypeOverlay (feature, attributes, params, i) {
    try {
      if (!this.map) return;
      let marker = document.createElement('div');
      marker.className = 'overlay-point iconfont';
      let color = '#08eb18', fontSize = '31px', opacity = 1, ele = '',
        id = null, icon = null, coordinate = [], span = null, m = 0;
      if (attributes['icon']) {
        icon = attributes['icon'];
      } else if (params['icon']) {
        icon = params['icon'];
      }
      if (icon) {
        if (icon['className']) {
          $(marker).addClass(icon.className);
        }
        if (icon['color']) {
          color = icon.color;
        }
        if (icon['fontSize']) {
          fontSize = icon.fontSize;
        }
        if (icon['opacity']) {
          opacity = icon.opacity;
        }
        if (icon['element']) {
          ele = document.createElement('div');
          ele.className = icon['element']['className'] ? icon['element']['className'] : 'maked-point';
          ele.style.top = icon['element']['top'] ? icon['element']['top'] : '-100%';
          ele.style.left = icon['element']['left'] ? icon['element']['left'] : '100%';
          ele.style.fontSize = icon['element']['fontSize'] ? icon['element']['fontSize'] : '16px';
          ele.style.borderColor = icon['element']['borderColor'] ? icon['element']['borderColor'] : '#2A2A2A';
          ele.style.borderWidth = icon['element']['borderWidth'] ? icon['element']['borderWidth'] : '1px';
          ele.innerHTML = icon['element']['text'] ? icon['element']['text'] : ''
        }
      }
      if (params['orderBy']) {
        m = i + 1;
        span = document.createElement('span');
      } else if (params["orderByNum"] && attributes['number']) {
        m = Number(attributes.number) + 1;
        span = document.createElement('span');
      }
      if (!!span && ele == '') {
        span.innerHTML = m;
        marker.appendChild(span);
      }
      if (ele !== '') {
        marker.appendChild(ele);
      }
      marker.style.color = color;
      marker.style.fontSize = fontSize;
      marker.style.opacity = opacity;
      marker.selectColor = "#1b9de8";
      marker.normalColor = color;
      marker.onmousedown = function (ev) {
        if (ev.button == 2) {//鼠标右键
          window.ObservableObj.dispatchEvent({
            type: 'rightMenuEvt',
            originEvent: ev,
            value: feature
          });
        } else if (ev.button == 0) {//鼠标左键
          window.ObservableObj.dispatchEvent({
            type: 'overlayEvent',
            originEvent: ev,
            value: feature
          });
        }
      };
      if (feature) {
        id = feature.getId();
        let overlaytemp = this.map.getOverlayById(id);
        if (!overlaytemp) {
          coordinate = feature.getGeometry().getCoordinates();
          let iconOverlay = new ol.Overlay({
            element: marker,
            positioning: 'center-center',
            id: id,
            offset: [0, -10],
            stopEvent: true
          });
          iconOverlay.set('feature', feature);
          iconOverlay.setPosition(coordinate);
          //设置标识参数
          if (params) {
            iconOverlay.set("params", params);
            if (params['layerName']) {
              iconOverlay.set("layerName", params.layerName);
            }
          }
          this.map.addOverlay(iconOverlay);
        } else {
          overlaytemp.setElement(marker)
        }
      }
    } catch (e) {

    }
  }

  /**
   * 添加线要素
   * @param feature
   * @param params
   * @returns {*}
   */
  addPolyline (feature, params) {
    if (!this.map) return;
    let features = [];
    if (feature instanceof Array) {
      features = feature;
    } else {
      features.push(feature);
    }

    let style = null, selectStyle = null, lineStyle = null, lineSelectStyle = null;
    if (params['style']) {
      style = params['style'];
    } else {
      style = {width: 4, color: '#0000EE'};
    }
    if (params['selectStyle']) {
      selectStyle = params['selectStyle'];
    } else {
      selectStyle = {width: 6, color: '#FF0000'}
    }
    lineStyle = new ol.style.Style({
      stroke: new ol.style.Stroke(style)
    });
    lineSelectStyle = new ol.style.Style({
      stroke: new ol.style.Stroke(selectStyle)
    });


    let linefeature;
    for (let i = 0; i < features.length; i++) {
      let _feat = features[i];
      if (_feat.geometry.hasOwnProperty('paths')) {
        let feat = {
          'type': 'Feature',
          'geometry': {
            'type': 'MultiLineString',
            'coordinates': _feat.geometry.paths
          }
        };
        this.currentMapLines = this.currentMapLines.concat(_feat.geometry.paths);
        linefeature = (new ol.format.GeoJSON()).readFeature(feat);
      } else {
        linefeature = new ol.Feature({
          geometry: new ol.format.WKT().readGeometry(_feat.geometry)
        });
        let extent = linefeature.getGeometry().getExtent();
        this.currentMapLines.push([[extent[0], extent[1]], [extent[2], extent[3]]]);
        this.zoomToExtent(extent, false);
      }

      if (params['showStyle']) {
        linefeature.set('normalStyle', lineStyle);
        linefeature.set('selectStyle', lineSelectStyle);
      }

      if (!_feat['attributes']) {
        _feat['attributes'] = {};
        _feat.attributes['layerName'] = params['layerName'];
      }

      if (_feat.attributes['ID'] || _feat.attributes['id']) {
        linefeature.setId(_feat.attributes['ID'] || _feat.attributes['id']);
        linefeature.set('layerName', params['layerName']);
        linefeature.setProperties(_feat.attributes);
      }

      if (lineStyle != null) {
        linefeature.setStyle(lineStyle);//设置线段样式
      }
      if (params['layerName']) {
        let layer = this.getTempVectorLayer(params.layerName, {
          create: true
        });
        layer.getSource().addFeature(linefeature);
        this.lineLayers.push(params.layerName);
      } else {
        this.tempVectorLayer.getSource().addFeature(linefeature);
      }
      this.OrderLayerZindex();
      return linefeature;
    }

  };

  /**
   * 添加实景播放地图相关要素
   * @param feature
   * @param params
   */
  addPanoViewLine (feature, params) {
    if (!this.map) return;
    let [ style, selectStyle, lineStyle, lineSelectStyle, linefeature ] = [ null, null, null, null, null ]
    if (params['style']) {
      style = params['style'];
    } else {
      style = {width: 4, color: '#418DDA'};
    }
    if (params['selectStyle']) {
      selectStyle = params['selectStyle'];
    } else {
      selectStyle = {width: 6, color: '#6EB021'}
    }
    lineStyle = new ol.style.Style({
      stroke: new ol.style.Stroke(style)
    });
    lineSelectStyle = new ol.style.Style({
      stroke: new ol.style.Stroke(selectStyle)
    });
    if (feature.geometry.hasOwnProperty('paths')) {
      let feat = {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': feature.geometry.paths
        }
      };
      this.currentMapLines = this.currentMapLines.concat(feature.geometry.paths);
      linefeature = (new ol.format.GeoJSON()).readFeature(feat);
    } else {
      linefeature = new ol.Feature({
        geometry: new ol.format.WKT().readGeometry(feature.geometry)
      });
      let extent = linefeature.getGeometry().getExtent();
      this.currentMapLines.push([[extent[0], extent[1]], [extent[2], extent[3]]]);
      this.zoomToExtent(extent, false);
    }
    if (params['showStyle']) {
      linefeature.set('normalStyle', lineStyle);
      linefeature.set('selectStyle', lineSelectStyle);
    }
    if (!feature['attributes']) {
      feature['attributes'] = {};
      feature.attributes['layerName'] = params['layerName'];
    }
    if (feature.attributes['ID'] || feature.attributes['id']) {
      linefeature.setId(feature.attributes['ID'] || feature.attributes['id']);
      linefeature.set('layerName', params['layerName']);
      linefeature.setProperties(feature.attributes);
    }
    if (lineStyle != null) {
      linefeature.setStyle(lineStyle);//设置线段样式
    }
    if (params['layerName']) {
      let layer = this.getTempVectorLayer(params.layerName, {
        create: true
      });
      let [ coords , startPoint, endPoint ] = [ [], null, null ];
      if (feature && feature['attributes']) {
        if (feature['attributes']['QDPTX'] && feature['attributes']['QDPTY']) {
          startPoint = [feature['attributes']['QDPTX'], feature['attributes']['QDPTY']]
        }
        if (feature['attributes']['ZDPTX'] && feature['attributes']['ZDPTY']) {
          endPoint = [feature['attributes']['ZDPTX'], feature['attributes']['ZDPTY']]
        }
      }
      if (!startPoint || !endPoint) {
        coords = linefeature.getGeometry().getCoordinates()
        coords.every(item => {
          if (item && Array.isArray(item) && item.length === 2) {
            startPoint = coords[0]
            endPoint = coords[coords.length - 1]
            return false
          } else if (item && Array.isArray(item) && item.length > 2) {
            item.every(_item => {
              if (_item && Array.isArray(_item) && _item.length === 2) {
                startPoint = item[0]
                // 部分数据是双重数据需要取到数据的最后一个坐标（暂时无法解析正确）
                endPoint = coords[coords.length - 1][0]
              }
            })
            return false
          }
        })
      }
      this.addPoint({
        geometry: startPoint
      }, {
        layerName: params['layerName'],
        imgSrc: params['startPointSrc'],
        disZoomToExtent: false
      })
      this.addPoint({
        geometry: endPoint
      }, {
        layerName: params['layerName'],
        imgSrc: params['endPointSrc'],
        disZoomToExtent: false
      })
      layer.getSource().addFeature(linefeature);
      this.lineLayers.push(params.layerName);
    } else {
      this.tempVectorLayer.getSource().addFeature(linefeature);
    }
    this.OrderLayerZindex();
    return linefeature;
  };

  /**
   * 添加多条线要素
   * @param features
   * @param params
   */
  addPolylines (features, params) {
    if (!this.map) return;
    if (params['isclear']) {
      this.clearGraphics();
    }
    if (features != null && features.length > 0) {
      features.forEach(feat => {
        this.addPolyline(feat, params);
      });
      let extent = new ol.geom.MultiLineString(this.currentMapLines, null).getExtent();
      extent = this.adjustExtent(extent);
      this.zoomToExtent(extent, false);
    }
  };

  /**
   * 添加面要素
   * @param polygon
   * @param params
   * @returns {ol.render.Feature|ol.format.Feature|Feature|*|ol.Feature}
   */
  addPolygon (polygon, params) {
    if (polygon && polygon['geometry']) {
      let geometry = null;
      if (polygon.geometry instanceof ol.geom.Geometry) {
        geometry = polygon.geometry;
      } else if (polygon.geometry.hasOwnProperty('rings')) {
        geometry = (new ol.format.GeoJSON()).readGeometry(polygon.geometry);
      } else {
        geometry = new ol.format.WKT().readGeometry(polygon.geometry);
      }
      let polygonFeature = new ol.Feature({
        geometry: geometry
      });
      let style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(67, 110, 238, 0.4)'
        }),
        stroke: new ol.style.Stroke({
          color: '#4781d9',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      });
      let extent = polygonFeature.getGeometry().getExtent();
      if (style && polygonFeature) {
        polygonFeature.setStyle(style);
      }
      if (polygon['attributes'] && (polygon.attributes['ID'] || polygon.attributes['id'])) {
        let id = (polygon.attributes['id'] || polygon.attributes['ID'] || params['id']);
        polygonFeature.setId(id);
        polygonFeature.setProperties(polygon.attributes);
      }
      if (params['zoomToExtent']) {
        this.zoomToExtent(extent, true);
      }
      if (params['layerName']) {
        let layer = this.getTempVectorLayer(params['layerName'], {
          create: true
        });
        layer.getSource().addFeature(polygonFeature);
      }
      return polygonFeature;
    } else {
      console.info('传入的数据不标准！')
    }
  }

  /**
   * 添加多个面
   * @param polygons
   * @param params
   */
  addPolygons (polygons, params) {
    if (polygons && Array.isArray(polygons)) {
      let MultiPolygon = new ol.geom.MultiPolygon([]), change = false;
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = !params['zoomToExtent'];
        change = true;
      };
      for (let i = 0; i < polygons.length; i++) {
        let polygon = this.addPolyline(polygons[i], params);
        MultiPolygon.appendPolygon(polygon.getGeometry());
      }
      if (change) {
        this._getExtent(MultiPolygon);
      }
    }
  }

  /**
   * 创建查询circle
   * @param layerName
   * @param obj
   * @param radius
   * @returns {null|*}
   */
  createSreachCircle (layerName, obj, radius) {
    if (!this.map) return;
    if (!radius) {
      radius = 5000;
    }
    let style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(65,105,225, 0.5)'
      })
    });
    let config = {
      radius: radius,
      maxRadius: 50000,
      map: this.map,
      layerName: layerName,
      style: style
    };
    if (config.radius > config.maxRadius) {
      config.radius = config.maxRadius
    }
    obj = $.extend(config, obj);
    if (!this.circleSerachFeat) {
      this.circleSerachFeat = new ol.Observable.CustomCircle(obj);
      let extent = this.circleSerachFeat.getExtent();
      this.zoomToExtent(extent);
    } else {
      this.circleSerachFeat.setCenter(obj.center);
      this.circleSerachFeat.setRadius(obj.radius);
    }
    return this.circleSerachFeat;
  }

  /**
   * 添加地图标记
   * @param params
   */
  showMarkPopup (params) {
    let m = {
      positioning: 'center-center',
      id: params['id']
    };
    if (!params['offset']) {
      params['offset'] = [-33, 0]
    }
    params = $.extend(params, m);
    let popup = new ol.Overlay.Popup(params);
    this.map.addOverlay(popup);
    let feature = popup.getBottomMarkFea();
    if (feature) {
      feature.set('params', {
        moveable: true,
        popupFeature: true
      });
      this.tempVectorLayer.getSource().addFeature(feature)
    }
    popup.show(params.coordinate, params.content);
    $('.iw_bt.button-xz').unbind('click').on('click', event => {
      let input = $(event.target).parent().siblings('div').find('input');
      let inputTitle = input.val();
      let overLayId = $(event.target).closest('.ol-popup')[0].id;
      let popup = this.map.getOverlayById(overLayId);
      this.showMarkPopupConfirm(overLayId);
      popup.showMin();
      if (inputTitle && inputTitle !== "") {
        popup.setMinText(inputTitle);
      }
    });
    $('.iw_bt.button-bxz').unbind('click').on('click', event => {
      let input = $(event.target).parent().siblings('div').find('input');
      let overLayId = $(event.target).closest(".ol-popup")[0].id;
      this.removeMarkPopupById(overLayId);
    });
    this.mapTools.addMaker = false;
    if (this.addPointHandlerClick) {
      ol.Observable.unByKey(this.addPointHandlerClick);
    }
  };

  /**
   * 通过id移除标记
   * @param id
   */
  removeMarkPopupById (id) {
    if (this.map) {
      let targetOverlay = this.map.getOverlayById(id);
      if (targetOverlay) {
        if (targetOverlay instanceof ol.Overlay.Popup) {
          this.removeFeature(targetOverlay.getBottomMarkFea());
        }
        this.map.removeOverlay(targetOverlay);
      }
    }
  };

  showMarkPopupConfirm (obj) {
    console.log("点击了确定");
  };

  /**
   * 空间数据获取外包圆半径
   * @param geometrys
   * @returns {Array}
   */
  getRadiusSquared (geometrys) {
    let MultiPolygon = new ol.geom.MultiPolygon();
    let sourceProj = this.map.getView().getProjection();
    let extent = [], radius = null, center = [];
    for (let i = 0; i < geometrys.length; i++) {
      MultiPolygon.appendPolygon(geometrys[i]);
    }
    if (MultiPolygon.getPolygons().length > 0) {
      extent = MultiPolygon.getExtent();
      let bExtent = true;
      for (let m = 0; m < 4; m++) {
        if (extent[m] == Infinity || extent[m] == NaN) {
          bExtent = false;
          break;
        }
      }
      if (bExtent) {
        let minx = extent[0], miny = extent[1], maxx = extent[2], maxy = extent[3];
        let c1 = ol.proj.transform([minx, miny], sourceProj, 'EPSG:4326');
        let c2 = ol.proj.transform([maxx, miny], sourceProj, 'EPSG:4326');
        let c3 = ol.proj.transform([minx, miny], sourceProj, 'EPSG:4326');
        let c4 = ol.proj.transform([minx, maxy], sourceProj, 'EPSG:4326');
        let x = this.wgs84Sphere.haversineDistance(c1, c2);
        let y = this.wgs84Sphere.haversineDistance(c3, c4);
        radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 2;
        center = ol.extent.getCenter(extent)
      }
    }
    return {
      radius: radius,
      extent: extent,
      center: center
    };
  };

  /**
   * 气泡弹窗
   * @param obj
   * @param offset
   */
  showPopup (obj, offset, noPanIntoView) {
    if (!this.map) return;
    let id = '';
    if (this.popupOverlay && !obj['notClear']) {
      this.map.removeOverlay(this.popupOverlay);
      this.popupOverlay = null;
    }
    if (obj['id']) {
      id = obj['id'] + 'overlay';
    } else {
      id = 'overlay' + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000 + 1);
    }
    let m = {
      positioning: 'center-center',
      id: id
    };
    if (offset) {
      m.offset = offset;
    }
    obj = $.extend(obj, m);
    this.popupOverlay = new ol.Overlay.Popup(obj);
    this.map.addOverlay(this.popupOverlay);
    this.popupOverlay.show(obj.coordinate, obj.content);
    if (!noPanIntoView) {
      this.panIntoView_(this.popupOverlay, obj.coordinate, null)
    }
  };

  /**
   * 关闭气泡
   * @param exceptId
   * @returns {boolean}
   */
  closePopup (exceptId) {
    if (!this.map) return;
    if (this.popupOverlay) {
      if (this.popupOverlay.getId() !== exceptId) {
        this.map.removeOverlay(this.popupOverlay);
        this.popupOverlay = null;
      }
    }
    return false;
  };

  /**
   * 通过id关闭气泡
   * @param id
   * @returns {ol.Overlay}
   */
  closePopupById (id) {
    if (!this.map) return;
    let popOverlay = this.map.getOverlayById(id)
    this.map.removeOverlay(popOverlay);
    return popOverlay
  }

  /**
   * 判断气泡是否在地图范围内
   * @param overlay
   * @param coordinate
   * @param duration
   * @returns {ol.Coordinate|undefined}
   * @private
   */
  panIntoView_ (overlay, coordinate, duration) {
    if (!this.map) return;
    let popSize = {
        width: overlay.getElement().clientWidth + 20,
        height: overlay.getElement().clientHeight + 20
      },
      mapSize = this.map.getSize();
    let tailHeight = 40,
      tailOffsetLeft = 60,
      tailOffsetRight = popSize.width - tailOffsetLeft,
      popOffset = overlay.getOffset(),
      popPx = this.map.getPixelFromCoordinate(coordinate);

    let fromLeft = (popPx[0] - tailOffsetLeft),
      fromRight = mapSize[0] - (popPx[0] + tailOffsetRight);

    let fromTop = popPx[1] - popSize.height + popOffset[1],
      fromBottom = mapSize[1] - (popPx[1] + tailHeight) - popOffset[1];

    let center = this.map.getView().getCenter(),
      curPx = this.map.getPixelFromCoordinate(center),
      newPx = curPx.slice();

    if (fromRight < 0) {
      newPx[0] -= fromRight;
    } else if (fromLeft < 0) {
      newPx[0] += fromLeft;
    }

    if (fromTop < 0) {
      newPx[1] += fromTop;
    } else if (fromBottom < 0) {
      newPx[1] -= fromBottom;
    }
    //平移地图
    if (!duration) {
      duration = 1000;
      let start = +new Date();
      let pan = ol.animation.pan({
        duration: duration,
        source: /** @type {ol.Coordinate} */ (this.map.getView().getCenter()),
        start: start
      });
      let bounce = ol.animation.bounce({
        duration: duration,
        resolution: this.map.getView().getResolution(),
        start: start
      });
      this.map.beforeRender(pan);
    }
    if (newPx[0] !== curPx[0] || newPx[1] !== curPx[1]) {
      this.map.getView().setCenter(this.map.getCoordinateFromPixel(newPx));
    }
    return this.map.getView().getCenter();
  };

  /**
   * 通过id获取feature（layerName可以不传，不传就是在所有图层查找）
   * @param id
   * @param layerName
   * @returns {*}
   */
  getFeatureById (id, layerName) {
    if (!this.map) return;
    let feature = null;
    if (!!layerName) {
      let layer = this.getLayerByName(layerName);
      if (layer && layer instanceof ol.layer.Vector) {
        feature = layer.getSource().getFeatureById(id)
      }
    }
    if (!feature) {
      let layers = this.map.getLayers().getArray()
      for (let i = 0; i < layers.length; i++) {
        if (layers[i] && layers[i] instanceof ol.layer.Vector && layers[i].getSource()) {
          feature = layers[i].getSource().getFeatureById(id)
          if (feature && feature instanceof ol.Feature) {
            break;
          }
        }
      }
    }
    return feature;
  }

  /**
   * 通过id高亮overlay
   * @param id
   * @returns {ol.Overlay}
   */
  highlightedOverlayById (id) {
    if (this.map && !!id && id !== '') {
      let overlay = this.map.getOverlayById(id);
      if (overlay && overlay instanceof ol.Overlay) {
        let overlayElement = overlay.getElement()
        overlayElement.style.color = overlayElement.selectColor;
        $(overlayElement).children("div").css('borderColor', overlayElement.selectColor)
        $(overlayElement).addClass('marker-raise');
        return overlay;
      }
    }
  }

  /**
   * 通过id取消高亮
   * @param id
   * @returns {ol.Overlay}
   */
  unHighlightedOverlayById (id) {
    if (this.map && !!id && id !== '') {
      let overlay = this.map.getOverlayById(id);
      if (overlay && overlay instanceof ol.Overlay) {
        let overlayElement = overlay.getElement()
        overlayElement.style.color = overlayElement.normalColor;
        $(overlayElement).children("div").css('borderColor', overlayElement.normalColor)
        $(overlay.getElement()).removeClass('marker-raise');
        return overlay;
      }
    }
  }

  /**
   * 调整当前要素范围
   * @param extent
   * @returns {*}
   */
  adjustExtent (extent) {
    if (this.map) {
      let width = ol.extent.getWidth(extent);
      let height = ol.extent.getHeight(extent);
      let adjust = 0.2;
      if (width < 0.05) {
        let bleft = ol.extent.getBottomLeft(extent);//获取xmin,ymin
        let tright = ol.extent.getTopRight(extent);//获取xmax,ymax
        let xmin = bleft[0] - adjust;
        let ymin = bleft[1] - adjust;
        let xmax = tright[0] + adjust;
        let ymax = tright[1] + adjust;
        extent = ol.extent.buffer(extent, adjust);
      }
      return extent;
    }
  }

  /**
   * 获取当前范围
   * @param multiPoint
   * @returns {Array}
   * @private
   */
  _getExtent (multiPoint) {
    if (this.map) {
      let extent = [];
      if (multiPoint.getPoints().length > 0) {
        extent = multiPoint.getExtent();
        let bExtent = true;
        for (let m = 0; m < 4; m++) {
          if (extent[m] == Infinity || extent[m] == NaN) {
            bExtent = false;
            break;
          }
        }
        if (bExtent) {
          this.zoomToExtent(extent, true);
        }
      }
      return extent;
    }
  };

  /**
   * 缩放到当前范围
   * @param extent
   * @param isanimation
   * @param duration
   */
  zoomToExtent (extent, isanimation, duration) {
    if (this.map) {
      let view = this.map.getView();
      let size = this.map.getSize();
      /**
       *  @type {ol.Coordinate} center The center of the view.
       */
      let center = ol.extent.getCenter(extent);
      if (!isanimation) {
        view.fit(extent, size);
        view.setCenter(center);
      } else {
        if (!duration) {
          duration = 100;
          let pan = ol.animation.pan({
            duration: duration,
            source: /** @type {ol.Coordinate} */ (view.getCenter())
          });
          let bounce = ol.animation.bounce({
            duration: duration,
            resolution: view.getResolution()
          });
          this.map.beforeRender(pan, bounce);
          view.setCenter(center);
          view.fit(extent, size);
        }
      }
    }
  };

  /**
   * 根据当前线要素缩放
   * @param features
   */
  zoomByLineFeatures (features) {
    if (this.map && Array.isArray(features)) {
      let multiLine = new ol.geom.MultiLineString([]);
      features.forEach(feature => {
        if (feature && feature['geometry']) {
          let linefeature = null;
          if (feature.geometry.hasOwnProperty('paths')) {
            let feat = {
              'type': 'Feature',
              'geometry': {
                'type': 'LineString',
                'coordinates': feature.geometry.paths[0]
              }
            };
            linefeature = (new ol.format.GeoJSON()).readFeature(feat);
          } else {
            linefeature = new ol.Feature({
              geometry: new ol.format.WKT().readGeometry(feature.geometry)
            });
          }
          multiLine.appendLineString(linefeature.getGeometry());
        }
      })
      if (multiLine && multiLine.getLineStrings().length > 0) {
        let extent = multiLine.getExtent();
        this.zoomToExtent(extent, true);
      }
    }
  };

  /**
   * 调整图层
   * @constructor
   */
  OrderLayerZindex () {
    if (this.map) {
      let layerindex = 5;
      let layers = this.map.getLayers();
      //调整面图层
      layers.forEach(layer => {
        let layerNameTemp = layer.get("layerName");
        if (this.polygonLayers.indexOf(layerNameTemp) >= 0) {
          layer.setZIndex(layerindex++);
        }
      }, this);
      //调整线图层
      layers.forEach(layer => {
        let layerNameTemp = layer.get("layerName");
        if (this.lineLayers.indexOf(layerNameTemp) >= 0) {
          layer.setZIndex(layerindex++);
        }
      }, this);
      //调整点图层
      layers.forEach(layer => {
        let layerNameTemp = layer.get("layerName");
        if (this.pointLayers.indexOf(layerNameTemp) >= 0) {
          layer.setZIndex(layerindex++);
        }
      }, this);
    }
  };

  /**
   * 获取当前地图的范围
   * @returns {ol.Extent}
   */
  getMapCurrentExtent () {
    if (this.map) {
      return this.map.getView().calculateExtent(this.map.getSize());
    }
  };

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   */
  MovePointToView (coord) {
    if (this.map) {
      let extent = this.getMapCurrentExtent();
      if (!(ol.extent.containsXY(extent, coord[0], coord[1]))) {
        this.map.getView().setCenter([coord[0], coord[1]]);
      }
    }
  };

  /**
   * 设置当前overLay不可见
   * @param id
   */
  setOverLayOpacityById (id) {
    if (this.map && !!id) {
      let overLay = this.map.getOverlayById(id);
      if (overLay && overLay instanceof ol.Overlay) {
        let opacity = (overLay.getElement().style.opacity === '0') ? 1 : 0;
        overLay.getElement().style.opacity = opacity;
      }
    }
  }

  /**
   * 通过id移除overlay
   * @param id
   * @returns {ol.Overlay}
   */
  removeOverlayById (id) {
    if (this.map && !!id) {
      let overLay = this.map.getOverlayById(id);
      if (overLay && overLay instanceof ol.Overlay) {
        this.map.removeOverlay(overLay);
      }
      return overLay;
    }
  }

  /**
   * 标记当前overlay
   * @param id
   * @param layerName
   */
  makeOverLayById (id, layerName) {
    if (this.map && !!id) {
      let overLay = this.map.getOverlayById(id);
      if (overLay && overLay instanceof ol.Overlay) {
        overLay.set('layerName', layerName)
      }
    }
  }

  /**
   * 清除地图上所有东西
   */
  clearGraphics () {
    if (!this.map) return;
    this.removeDrawInteraion();
    this.deactiveAll();
    this.map.getOverlays().clear();
    this._lastDrawInteractionGeometry = null;
    this.clearTempLayers();
    this.removeAllTileLayer();
    this.removeDrawInteraion();
    this.deactiveAll();
    this.map.getOverlays().clear();
    this.removeAllTileLayer();
    this._activePointInteraction(true);
    if (this.addPointHandlerClick) {
      ol.Observable.unByKey(this.addPointHandlerClick);
      this.addPointHandlerClick = null
    }
    if (this.pointerMoveHandler) {
      ol.Observable.unByKey(this.pointerMoveHandler);
      this.pointerMoveHandler = null
    }
  }

  /**
   * 清除所有临时图层
   */
  clearTempLayers () {
    if (this.map) {
      let layers = this.map.getLayers();
      if (layers) {
        layers.forEach(layer => {
          if (layer instanceof ol.layer.Vector) {
            if (layer.getSource() && layer.getSource().clear) {
              layer.getSource().clear();
            }
          }
        }, this);
      }
    }
  }

  /**
   * 移除所有的专题图层
   */
  removeAllTileLayer () {
    if (!this.map) return;
    let layers = this.map.getLayers();
    layers.forEach(layer => {
      if (layer.get('isImage')) {
        this.map.removeLayer(layer);
      }
    });
  }

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
   * 移除周边搜索circle
   * @param layerName
   * @param params
   */
  removePerimeterSreach (layerName, params) {
    if (this.map && layerName && layerName !== '') {
      let layer = this.getLayerByName(layerName);
      if (layer && layer.getSource()) {
        layer.getSource().clear();
        this.circleSerachFeat.destroy();
        this.circleSerachFeat = null;
      }
    }
  }

  /**
   * 通过layerNames移除要素
   * @param layerNames
   */
  removeFeatureByLayerNames (layerNames) {
    if (!this.map) return;
    if (layerNames && layerNames instanceof Array) {
      let layers = this.map.getLayers();
      layers.forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
          if (layerNames.indexOf(layer.get('layerName')) >= 0) {
            if (layer.getSource() && layer.getSource().clear) {
              layer.getSource().clear();
            }
          }
        }
      })
    }
  }

  /**
   * 通过feature得到当前图层
   * @param feature
   * @returns {*}
   */
  getLayerByFeatuer (feature) {
    if (!this.map) return;
    let tragetLayer = null;
    if (feature instanceof ol.Feature) {
      let source = null;
      let layers = this.map.getLayers();
      layers.forEach(layer => {
        let source = layer.getSource();
        if (source.getFeatures) {
          let features = source.getFeatures();
          features.forEach(feat => {
            if (feat == feature) {
              tragetLayer = layer;
            }
          })
        }
      })
    } else {
      console.info("传入的不是要素");
    }
    return tragetLayer;
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

  /**
   * 通过layerName移除overLay
   * @param layerName
   */
  removeOverlayByLayerName (layerName) {
    if (this.map) {
      let overlays = this.map.getOverlays().getArray();
      let len = overlays.length;
      for (let i = 0; i < len; i++) {
        if (overlays[i] && overlays[i].get('layerName') === layerName) {
          this.map.removeOverlay(overlays[i]);
          i--;
        }
      }
    }
  }

  /**
   * 移除专题图层
   * @param layerName
   */
  removeTileLayerByLayerName (layerName) {
    if (!this.map) return;
    let layers = this.map.getLayers();
    layers.forEach(layer => {
      if (layer.get('isImage') && layer.get('layerName') && layer.get('layerName') === layerName) {
        this.map.removeLayer(layer);
      }
    });
  }
}
