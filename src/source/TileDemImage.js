/**
 * Created by FDD on 2017/11/7.
 * @desc 渲染dem数字高程模型
 */
import ol from 'openlayers'
ol.source.TileDemImage = function (options) {
  ol.source.UrlTile.call(this, {
    attributions: options.attributions,
    cacheSize: options.cacheSize,
    extent: options.extent,
    logo: options.logo,
    opaque: options.opaque,
    projection: options.projection,
    state: options.state,
    tileGrid: options.tileGrid,
    tileLoadFunction: options.tileLoadFunction
      ? options.tileLoadFunction : ol.source.TileDemImage.defaultTileLoadFunction,
    tilePixelRatio: options.tilePixelRatio,
    tileUrlFunction: options.tileUrlFunction,
    url: options.url,
    urls: options.urls,
    wrapX: options.wrapX
  })
  this.crossOrigin =
    options.crossOrigin !== undefined ? options.crossOrigin : null
  this.tileClass = options.tileClass !== undefined
    ? options.tileClass : ol.ImageTile
  this.tileCacheForProjection = {}
  this.tileGridForProjection = {}
  this.reprojectionErrorThreshold_ = options.reprojectionErrorThreshold
  this.renderReprojectionEdges_ = false
}

ol.inherits(ol.source.TileDemImage, ol.source.UrlTile)

/**
 * 是否为有效缓存
 * @returns {*}
 */
ol.source.TileDemImage.prototype.canExpireCache = function () {
  if (!ol.ENABLE_RASTER_REPROJECTION) {
    return ol.source.UrlTile.prototype.canExpireCache.call(this)
  }
  if (this.tileCache.canExpireCache()) {
    return true
  } else {
    for (let key in this.tileCacheForProjection) {
      if (this.tileCacheForProjection[key].canExpireCache()) {
        return true
      }
    }
  }
  return false
}

/**
 * 缓存有效时常
 * @param projection
 * @param usedTiles
 */
ol.source.TileDemImage.prototype.expireCache = function (projection, usedTiles) {
  if (!ol.ENABLE_RASTER_REPROJECTION) {
    ol.source.UrlTile.prototype.expireCache.call(this, projection, usedTiles)
    return
  }
  let usedTileCache = this.getTileCacheForProjection(projection)
  this.tileCache.expireCache(this.tileCache === usedTileCache ? usedTiles : {})
  for (let id in this.tileCacheForProjection) {
    let tileCache = this.tileCacheForProjection[id]
    tileCache.expireCache(tileCache === usedTileCache ? usedTiles : {})
  }
}

/**
 * 获取间隙
 * @param projection
 * @returns {number}
 */
ol.source.TileDemImage.prototype.getGutter = function (projection) {
  if (ol.ENABLE_RASTER_REPROJECTION &&
    this.getProjection() && projection &&
    !ol.proj.equivalent(this.getProjection(), projection)) {
    return 0
  } else {
    return this.getGutterInternal()
  }
}

/**
 * 获取间隙（私有）
 * @returns {number}
 */
ol.source.TileDemImage.prototype.getGutterInternal = function () {
  return 0
}

/**
 * 获取不透明度
 * @param projection
 * @returns {*}
 */
ol.source.TileDemImage.prototype.getOpaque = function (projection) {
  if (ol.ENABLE_RASTER_REPROJECTION &&
    this.getProjection() && projection &&
    !ol.proj.equivalent(this.getProjection(), projection)) {
    return false
  } else {
    return ol.source.UrlTile.prototype.getOpaque.call(this, projection)
  }
}

/**
 * 获取切片Grid
 * @param projection
 * @returns {*}
 */
ol.source.TileDemImage.prototype.getTileGridForProjection = function (projection) {
  if (!ol.ENABLE_RASTER_REPROJECTION) {
    return ol.source.UrlTile.prototype.getTileGridForProjection.call(this, projection)
  }
  let thisProj = this.getProjection()
  if (this.tileGrid &&
    (!thisProj || ol.proj.equivalent(thisProj, projection))) {
    return this.tileGrid
  } else {
    var projKey = ol.getUid(projection).toString()
    if (!(projKey in this.tileGridForProjection)) {
      this.tileGridForProjection[projKey] =
        ol.tilegrid.getForProjection(projection)
    }
    return /** @type {!ol.tilegrid.TileGrid} */ (this.tileGridForProjection[projKey])
  }
}

/**
 * 获取缓存
 * @param projection
 * @returns {*}
 */
ol.source.TileDemImage.prototype.getTileCacheForProjection = function (projection) {
  if (!ol.ENABLE_RASTER_REPROJECTION) {
    return ol.source.UrlTile.prototype.getTileCacheForProjection.call(this, projection)
  }
  let thisProj = this.getProjection()
  if (!thisProj || ol.proj.equivalent(thisProj, projection)) {
    return this.tileCache
  } else {
    let projKey = ol.getUid(projection).toString()
    if (!(projKey in this.tileCacheForProjection)) {
      this.tileCacheForProjection[projKey] = new ol.TileCache(this.tileCache.highWaterMark)
    }
    return this.tileCacheForProjection[projKey]
  }
}

/**
 * 创建切片图层
 * @param z
 * @param x
 * @param y
 * @param pixelRatio
 * @param projection
 * @param key
 * @returns {ol.ImageTile}
 * @private
 */
ol.source.TileDemImage.prototype.createTile_ = function (z, x, y, pixelRatio, projection, key) {
  var tileCoord = [z, x, y]
  var urlTileCoord = this.getTileCoordForTileUrlFunction(tileCoord, projection)
  var tileUrl = urlTileCoord
    ? this.tileUrlFunction(urlTileCoord, pixelRatio, projection) : undefined
  var tile = new this.tileClass(
    tileCoord,
    tileUrl !== undefined ? ol.TileState.IDLE : ol.TileState.EMPTY,
    tileUrl !== undefined ? tileUrl : '',
    this.crossOrigin,
    this.tileLoadFunction)
  tile.key = key
  ol.events.listen(tile, ol.events.EventType.CHANGE,
    this.handleTileChange, this)
  return tile
}

/**
 * 获取切片
 * @param z
 * @param x
 * @param y
 * @param pixelRatio
 * @param projection
 * @returns {*}
 */
ol.source.TileDemImage.prototype.getTile = function (z, x, y, pixelRatio, projection) {
  if (!ol.ENABLE_RASTER_REPROJECTION || !this.getProjection() || !projection ||
    ol.proj.equivalent(this.getProjection(), projection)) {
    return this.getTileInternal(z, x, y, pixelRatio, /** @type {!ol.proj.Projection} */ (projection))
  } else {
    let cache = this.getTileCacheForProjection(projection)
    let tileCoord = [z, x, y]
    let tile
    let tileCoordKey = this.getKeyZXY.apply(this, tileCoord)
    if (cache.containsKey(tileCoordKey)) {
      tile = /** @type {!ol.Tile} */ (cache.get(tileCoordKey))
    }
    let key = this.getKey()
    if (tile && tile.key === key) {
      return tile
    } else {
      let sourceProjection = /** @type {!ol.proj.Projection} */ (this.getProjection())
      let sourceTileGrid = this.getTileGridForProjection(sourceProjection)
      let targetTileGrid = this.getTileGridForProjection(projection)
      let wrappedTileCoord = this.getTileCoordForTileUrlFunction(tileCoord, projection)
      let newTile = new ol.reproj.Tile(
        sourceProjection, sourceTileGrid,
        projection, targetTileGrid,
        tileCoord, wrappedTileCoord, this.getTilePixelRatio(pixelRatio),
        this.getGutterInternal(),
        function (z, x, y, pixelRatio) {
          return this.getTileInternal(z, x, y, pixelRatio, sourceProjection)
        }.bind(this), this.reprojectionErrorThreshold_,
        this.renderReprojectionEdges_)
      newTile.key = key
      if (tile) {
        newTile.interimTile = tile
        newTile.refreshInterimChain()
        cache.replace(tileCoordKey, newTile)
      } else {
        cache.set(tileCoordKey, newTile)
      }
      return newTile
    }
  }
}

/**
 * 获取切片（内置方法）
 * @param {number} z Tile coordinate z.
 * @param {number} x Tile coordinate x.
 * @param {number} y Tile coordinate y.
 * @param {number} pixelRatio Pixel ratio.
 * @param {!ol.proj.Projection} projection Projection.
 * @return {!ol.Tile} Tile.
 */
ol.source.TileDemImage.prototype.getTileInternal = function (z, x, y, pixelRatio, projection) {
  let tile = null
  let tileCoordKey = this.getKeyZXY(z, x, y)
  let key = this.getKey()
  if (!this.tileCache.containsKey(tileCoordKey)) {
    tile = this.createTile_(z, x, y, pixelRatio, projection, key)
    this.tileCache.set(tileCoordKey, tile)
  } else {
    tile = this.tileCache.get(tileCoordKey)
    if (tile.key !== key) {
      let interimTile = tile
      tile = this.createTile_(z, x, y, pixelRatio, projection, key)
      if (interimTile.getState() === ol.TileState.IDLE) {
        tile.interimTile = interimTile.interimTile
      } else {
        tile.interimTile = interimTile
      }
      tile.refreshInterimChain()
      this.tileCache.replace(tileCoordKey, tile)
    }
  }
  return tile
}

/**
 * 设置是否渲染重投影边（通常用于调试）。
 * @param render
 */
ol.source.TileDemImage.prototype.setRenderReprojectionEdges = function (render) {
  if (!ol.ENABLE_RASTER_REPROJECTION ||
    this.renderReprojectionEdges_ === render) {
    return
  }
  this.renderReprojectionEdges_ = render
  for (let id in this.tileCacheForProjection) {
    this.tileCacheForProjection[id].clear()
  }
  this.changed()
}

/**
 * 为切片网格设置投影
 * @param projection
 * @param tilegrid
 */
ol.source.TileDemImage.prototype.setTileGridForProjection = function (projection, tilegrid) {
  if (ol.ENABLE_RASTER_REPROJECTION) {
    let proj = ol.proj.get(projection)
    if (proj) {
      let projKey = ol.getUid(proj).toString()
      if (!(projKey in this.tileGridForProjection)) {
        this.tileGridForProjection[projKey] = tilegrid
      }
    }
  }
}

/**
 * 默认切片加载函数
 * @param imageTile
 * @param src
 */
ol.source.TileDemImage.defaultTileLoadFunction = function (imageTile, src) {
  imageTile.getImage().src = src
}

const olSourceTileDemImage = ol.source.TileDemImage
export default olSourceTileDemImage
