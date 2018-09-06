import ol from 'openlayers';
import {
  distance,
  squaredDistance,
  closestOnCircle,
  closestOnSegment,
  squaredDistanceToSegment
} from '../geom/coordinates';
import RBush from '../utils/RBush.js';
import { generateObjectInterFlag } from '../utils/utils';

/**
 * Sort segments by distance, helper function
 * @param a The first segment data.
 * @param b The second segment data.
 * @return {number} The difference in distance.
 */
function sortByDistance (a, b) {
  const deltaA = squaredDistanceToSegment(this.pixelCoordinate_, a.segment);
  const deltaB = squaredDistanceToSegment(this.pixelCoordinate_, b.segment);
  return deltaA - deltaB;
}

class Snap extends ol.interaction.Pointer {
  static handleEvent (evt) {
    const result = this.snapTo(evt.pixel, evt.coordinate, evt.map);
    if (result.snapped) {
      evt.coordinate = result.vertex.slice(0, 2);
      evt.pixel = result.vertexPixel;
    }
    return ol.interaction.Pointer.handleEvent.call(this, evt);
  }

  static handleUpEvent (evt) {
    const featuresToUpdate = Object.keys(this.pendingFeatures_).map(_key => this.pendingFeatures_[_key]);
    if (featuresToUpdate.length) {
      featuresToUpdate.forEach(this.updateFeature_.bind(this));
      this.pendingFeatures_ = {};
    }
    return false;
  }

  constructor (options = {}) {
    super({
      handleEvent: Snap.handleEvent,
      handleDownEvent: function () {
        return true;
      },
      handleUpEvent: Snap.handleUpEvent,
      stopDown: function () {
        return false;
      }
    });

    /**
     * source
     * @type {null}
     * @private
     */
    this.source_ = options.source ? options.source : null;

    /**
     * @private
     * @type {boolean}
     */
    this.vertex_ = options.vertex !== undefined ? options.vertex : true;

    /**
     * @private
     * @type {boolean}
     */
    this.edge_ = options.edge !== undefined ? options.edge : true;

    /**
     * features
     * @type {null}
     * @private
     */
    this.features_ = options.features ? options.features : null;

    /**
     * @type {Array}
     * @private
     */
    this.featuresListenerKeys_ = [];

    /**
     * @type {Object<number>}
     * @private
     */
    this.featureChangeListenerKeys_ = {};

    /**
     * Extents are preserved so indexed segment can be quickly removed
     * when its feature geometry changes
     * @type {Object<number>}
     * @private
     */
    this.indexedFeaturesExtents_ = {};

    /**
     * If a feature geometry changes while a pointer drag|move event occurs, the
     * feature doesn't get updated right away.  It will be at the next 'pointerup'
     * event fired.
     * @type {!Object<number>}
     * @private
     */
    this.pendingFeatures_ = {};

    /**
     * Used for distance sorting in sortByDistance_
     * @type {null}
     * @private
     */
    this.pixelCoordinate_ = null;

    /**
     * @type {number}
     * @private
     */
    this.pixelTolerance_ = options.pixelTolerance !== undefined ? options.pixelTolerance : 10;

    /**
     * @type {function: number}
     * @private
     */
    this.sortByDistance_ = sortByDistance.bind(this);

    /**
     * Segment RTree for each layer
     * @private
     */
    this.rBush_ = new RBush();

    /**
     * @const
     * @private
     * @type {Object<string, function(module:ol/Feature, module:ol/geom/Geometry)>}
     */
    this.SEGMENT_WRITERS_ = {
      'Point': this.writePointGeometry_,
      'LineString': this.writeLineStringGeometry_,
      'LinearRing': this.writeLineStringGeometry_,
      'Polygon': this.writePolygonGeometry_,
      'MultiPoint': this.writeMultiPointGeometry_,
      'MultiLineString': this.writeMultiLineStringGeometry_,
      'MultiPolygon': this.writeMultiPolygonGeometry_,
      'GeometryCollection': this.writeGeometryCollectionGeometry_,
      'Circle': this.writeCircleGeometry_
    };
  }

  /**
   * Add a feature to the collection of features that we may snap to.
   * @param feature Feature.
   * @param {boolean=} listener Whether to listen to the feature change or not
   *     Defaults to `true`.
   */
  addFeature (feature, listener) {
    const register = listener !== undefined ? listener : true;
    const _uid = generateObjectInterFlag(feature);
    const geometry = feature.getGeometry();
    if (geometry) {
      const segmentWriter = this.SEGMENT_WRITERS_[geometry.getType()];
      if (segmentWriter) {
        this.indexedFeaturesExtents_[_uid] = geometry.getExtent(ol.extent.createEmpty());
        segmentWriter.call(this, feature, geometry);
      }
    }

    if (register) {
      this.featureChangeListenerKeys_[_uid] = feature.on('change', this.handleFeatureChange_, this);
    }
  }

  /**
   * @param feature Feature.
   * @private
   */
  forEachFeatureAdd_ (feature) {
    this.addFeature(feature);
  }

  /**
   * @param feature Feature.
   * @private
   */
  forEachFeatureRemove_ (feature) {
    this.removeFeature(feature);
  }

  /**
   * @return Features.
   * @private
   */
  getFeatures_ () {
    let features;
    if (this.features_) {
      features = this.features_;
    } else if (this.source_) {
      features = this.source_.getFeatures();
    }
    return features;
  }

  /**
   * @param evt Event.
   * @private
   */
  _uid (evt) {
    this.addFeature(evt.feature);
  }

  /**
   * @param evt Event.
   * @private
   */
  handleFeatureRemove_ (evt) {
    this.removeFeature(evt.feature);
  }

  /**
   * @param evt Event.
   * @private
   */
  handleFeatureChange_ (evt) {
    const feature = evt.target;
    if (this.handlingDownUpSequence) {
      const uid = generateObjectInterFlag(feature);
      if (!(uid in this.pendingFeatures_)) {
        this.pendingFeatures_[uid] = feature;
      }
    } else {
      this.updateFeature_(feature);
    }
  }

  /**
   * Remove a feature from the collection of features that we may snap to.
   * @param feature Feature
   * @param {boolean=} listener Whether to unlisten to the feature change
   * or not. Defaults to `true`.
   */
  removeFeature (feature, listener) {
    const unregister = listener !== undefined ? listener : true;
    const _uid = generateObjectInterFlag(feature);
    const extent = this.indexedFeaturesExtents_[_uid];
    if (extent) {
      const rBush = this.rBush_;
      const nodesToRemove = [];
      rBush.forEachInExtent(extent, function (node) {
        if (feature === node.feature) {
          nodesToRemove.push(node);
        }
      });
      for (let i = nodesToRemove.length - 1; i >= 0; --i) {
        rBush.remove(nodesToRemove[i]);
      }
    }

    if (unregister) {
      ol.Observable.unByKey(this.featureChangeListenerKeys_[_uid]);
      delete this.featureChangeListenerKeys_[_uid];
    }
  }

  /**
   * @inheritDoc
   */
  setMap (map) {
    const currentMap = this.getMap();
    const keys = this.featuresListenerKeys_;
    const features = this.getFeatures_();
    if (currentMap) {
      keys.forEach(key_ => {
        ol.Observable.unByKey(key_);
      });
      keys.length = 0;
      features.forEach(this.forEachFeatureRemove_.bind(this));
    }
    super.setMap(map);
    if (map) {
      if (this.source_) {
        keys.push(
          this.source_.on('addfeature', this.handleFeatureAdd_, this),
          this.source_.on('removefeature', this.handleFeatureRemove_, this)
        );
      }
      features.forEach(this.forEachFeatureAdd_.bind(this));
    }
  }

  /**
   * @param pixel Pixel
   * @param pixelCoordinate Coordinate
   * @param map Map.
   * @return Snap result
   */
  snapTo (pixel, pixelCoordinate, map) {
    const lowerLeft = map.getCoordinateFromPixel(
      [pixel[0] - this.pixelTolerance_, pixel[1] + this.pixelTolerance_]);
    const upperRight = map.getCoordinateFromPixel(
      [pixel[0] + this.pixelTolerance_, pixel[1] - this.pixelTolerance_]);
    const box = ol.extent.boundingExtent([lowerLeft, upperRight]);

    let segments = this.rBush_.getInExtent(box);

    // If snapping on vertices only, don't consider circles
    if (this.vertex_ && !this.edge_) {
      segments = segments.filter(function (segment) {
        return segment.feature.getGeometry().getType() !==
          'Circle';
      });
    }

    let snappedToVertex = false;
    let snapped = false;
    let vertex = null;
    let vertexPixel = null;
    let dist, pixel1, pixel2, squaredDist1, squaredDist2;
    if (segments.length > 0) {
      this.pixelCoordinate_ = pixelCoordinate;
      segments.sort(this.sortByDistance_);
      const closestSegment = segments[0].segment;
      const isCircle = segments[0].feature.getGeometry().getType() ===
        'Circle';
      if (this.vertex_ && !this.edge_) {
        pixel1 = map.getPixelFromCoordinate(closestSegment[0]);
        pixel2 = map.getPixelFromCoordinate(closestSegment[1]);
        squaredDist1 = squaredDistance(pixel, pixel1);
        squaredDist2 = squaredDistance(pixel, pixel2);
        dist = Math.sqrt(Math.min(squaredDist1, squaredDist2));
        snappedToVertex = dist <= this.pixelTolerance_;
        if (snappedToVertex) {
          snapped = true;
          vertex = squaredDist1 > squaredDist2 ? closestSegment[1] : closestSegment[0];
          vertexPixel = map.getPixelFromCoordinate(vertex);
        }
      } else if (this.edge_) {
        if (isCircle) {
          vertex = closestOnCircle(pixelCoordinate,
            (segments[0].feature.getGeometry()));
        } else {
          vertex = closestOnSegment(pixelCoordinate, closestSegment);
        }
        vertexPixel = map.getPixelFromCoordinate(vertex);
        if (distance(pixel, vertexPixel) <= this.pixelTolerance_) {
          snapped = true;
          if (this.vertex_ && !isCircle) {
            pixel1 = map.getPixelFromCoordinate(closestSegment[0]);
            pixel2 = map.getPixelFromCoordinate(closestSegment[1]);
            squaredDist1 = squaredDistance(vertexPixel, pixel1);
            squaredDist2 = squaredDistance(vertexPixel, pixel2);
            dist = Math.sqrt(Math.min(squaredDist1, squaredDist2));
            snappedToVertex = dist <= this.pixelTolerance_;
            if (snappedToVertex) {
              vertex = squaredDist1 > squaredDist2 ? closestSegment[1] : closestSegment[0];
              vertexPixel = map.getPixelFromCoordinate(vertex);
            }
          }
        }
      }
      if (snapped) {
        vertexPixel = [Math.round(vertexPixel[0]), Math.round(vertexPixel[1])];
      }
    }
    return {
      snapped: snapped,
      vertex: vertex,
      vertexPixel: vertexPixel
    };
  }

  /**
   * @param feature Feature
   * @private
   */
  updateFeature_ (feature) {
    this.removeFeature(feature, false);
    this.addFeature(feature, false);
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeCircleGeometry_ (feature, geometry) {
    const polygon = ol.geom.Polygon.fromCircle(geometry);
    const coordinates = polygon.getCoordinates()[0];
    for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
      const segment = coordinates.slice(i, i + 2);
      const segmentData = ({
        feature: feature,
        segment: segment
      });
      this.rBush_.insert(ol.extent.boundingExtent(segment), segmentData);
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeGeometryCollectionGeometry_ (feature, geometry) {
    const geometries = geometry.getGeometriesArray();
    for (let i = 0; i < geometries.length; ++i) {
      const segmentWriter = this.SEGMENT_WRITERS_[geometries[i].getType()];
      if (segmentWriter) {
        segmentWriter.call(this, feature, geometries[i]);
      }
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeLineStringGeometry_ (feature, geometry) {
    const coordinates = geometry.getCoordinates();
    for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
      const segment = coordinates.slice(i, i + 2);
      const segmentData = ({
        feature: feature,
        segment: segment
      });
      this.rBush_.insert(ol.extent.boundingExtent(segment), segmentData);
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeMultiLineStringGeometry_ (feature, geometry) {
    const lines = geometry.getCoordinates();
    for (let j = 0, jj = lines.length; j < jj; ++j) {
      const coordinates = lines[j];
      for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        const segment = coordinates.slice(i, i + 2);
        const segmentData = ({
          feature: feature,
          segment: segment
        });
        this.rBush_.insert(ol.extent.boundingExtent(segment), segmentData);
      }
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeMultiPointGeometry_ (feature, geometry) {
    const points = geometry.getCoordinates();
    for (let i = 0, ii = points.length; i < ii; ++i) {
      const coordinates = points[i];
      const segmentData = ({
        feature: feature,
        segment: [coordinates, coordinates]
      });
      this.rBush_.insert(geometry.getExtent(), segmentData);
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writeMultiPolygonGeometry_ (feature, geometry) {
    const polygons = geometry.getCoordinates();
    for (let k = 0, kk = polygons.length; k < kk; ++k) {
      const rings = polygons[k];
      for (let j = 0, jj = rings.length; j < jj; ++j) {
        const coordinates = rings[j];
        for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
          const segment = coordinates.slice(i, i + 2);
          const segmentData = ({
            feature: feature,
            segment: segment
          });
          this.rBush_.insert(ol.extent.boundingExtent(segment), segmentData);
        }
      }
    }
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writePointGeometry_ (feature, geometry) {
    const coordinates = geometry.getCoordinates();
    const segmentData = ({
      feature: feature,
      segment: [coordinates, coordinates]
    });
    this.rBush_.insert(geometry.getExtent(), segmentData);
  }

  /**
   * @param feature Feature
   * @param geometry Geometry.
   * @private
   */
  writePolygonGeometry_ (feature, geometry) {
    const rings = geometry.getCoordinates();
    for (let j = 0, jj = rings.length; j < jj; ++j) {
      const coordinates = rings[j];
      for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        const segment = coordinates.slice(i, i + 2);
        const segmentData = ({
          feature: feature,
          segment: segment
        });
        this.rBush_.insert(ol.extent.boundingExtent(segment), segmentData);
      }
    }
  }
}

export default Snap;
