// https://github.com/ghettovoice/ol-rotate-feature

import ol from 'openlayers';
import olStyleFactory from '../style/factory';
const PointerInteraction = ol.interaction.Pointer;
const Collection = ol.Collection;
const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;
const Feature = ol.Feature;
const Point = ol.geom.Point;
const Polygon = ol.geom.Polygon;
const GeometryCollection = ol.geom.GeometryCollection;
const extentHelper = ol.extent;
const ANCHOR_KEY = 'rotate-anchor';
const ARROW_KEY = 'rotate-arrow';
const ANGLE_PROP = 'angle';
const ANCHOR_PROP = 'anchor';

/**
 * @enum {string}
 */
const RotateFeatureEventType = {
  /**
   * Triggered upon feature rotate start.
   * @event RotateFeatureEvent#rotatestart
   */
  START: 'rotatestart',
  /**
   * Triggered upon feature rotation.
   * @event RotateFeatureEvent#rotating
   */
  ROTATING: 'rotating',
  /**
   * Triggered upon feature rotation end.
   * @event RotateFeatureEvent#rotateend
   */
  END: 'rotateend'
};

/**
 * Events emitted by RotateFeatureInteraction instances are instances of this type.
 * @class
 * @author Vladimir Vershinin
 */
class RotateFeatureEvent {
  /**
   * @param {string} type Type.
   * @param {ol.Collection<ol.Feature>} features Rotated features.
   * @param {number} angle Angle in radians.
   * @param {ol.Coordinate} anchor Anchor position.
   */
  constructor (type, features, angle, anchor) {
    /**
     * @type {boolean}
     * @private
     */
    this.propagationStopped_ = false;

    /**
     * The event type.
     * @type {string}
     * @private
     */
    this.type_ = type;

    /**
     * The features being rotated.
     * @type {ol.Collection<ol.Feature>}
     * @private
     */
    this.features_ = features;
    /**
     * Current angle in radians.
     * @type {number}
     * @private
     */
    this.angle_ = angle;
    /**
     * Current rotation anchor.
     * @type {ol.Coordinate}
     * @private
     */
    this.anchor_ = anchor;
  }

  /**
   * @type {boolean}
   */
  get propagationStopped () {
    return this.propagationStopped_;
  }

  /**
   * @type {RotateFeatureEventType}
   */
  get type () {
    return this.type_;
  }

  /**
   * @type {ol.Collection<ol.Feature>}
   */
  get features () {
    return this.features_;
  }

  /**
   * @type {number}
   */
  get angle () {
    return this.angle_;
  }

  /**
   * @type {ol.Coordinate}
   */
  get anchor () {
    return this.anchor_;
  }

  /**
   * Prevent event propagation.
   */
  preventDefault () {
    this.propagationStopped_ = true;
  }

  /**
   * Stop event propagation.
   */
  stopPropagation () {
    this.propagationStopped_ = true;
  }
}

class RotateFeatureInteraction extends PointerInteraction {
  /**
   * @param {InteractionOptions} options
   */
  constructor (options = {}) {
    super({
      handleEvent: handleEvent,
      handleDownEvent: handleDownEvent,
      handleUpEvent: handleUpEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent
    });
    /**
     * @type {string}
     * @private
     */
    this.previousCursor_ = undefined;
    /**
     * @type {ol.Feature}
     * @private
     */
    this.anchorFeature_ = undefined;
    /**
     * @type {ol.Feature}
     * @private
     */
    this.arrowFeature_ = undefined;
    /**
     * @type {ol.Coordinate}
     * @private
     */
    this.lastCoordinate_ = undefined;
    /**
     * @type {boolean}
     * @private
     */
    this.anchorMoving_ = false;
    /**
     * @type {ol.layer.Vector}
     * @private
     */
    this.overlay_ = new VectorLayer({
      style: options.style || getDefaultStyle(),
      source: new VectorSource({
        features: new Collection()
      })
    });
    /**
     * @type {ol.Collection<ol.Feature>}
     * @private
     */
    this.features_ = undefined;
    if (options.features) {
      if (Array.isArray(options.features)) {
        this.features_ = new Collection(options.features);
      } else if (options.features instanceof Collection) {
        this.features_ = options.features;
      } else {
        throw new Error(
          'Features option should be an array or collection of features, ' +
            'got ' +
            typeof options.features
        );
      }
    } else {
      this.features_ = new Collection();
    }

    this.setAnchor(options.anchor || getFeaturesCentroid(this.features_));
    this.setAngle(options.angle || 0);

    this.features_.on('add', this.onFeatureAdd_, this);
    this.features_.on('remove', this.onFeatureRemove_, this);
    this.on('change:' + ANGLE_PROP, this.onAngleChange_, this);
    this.on('change:' + ANCHOR_PROP, this.onAnchorChange_, this);

    this.createOrUpdateAnchorFeature_();
    this.createOrUpdateArrowFeature_();
  }

  /**
   * @type {ol.Collection<ol.Feature>}
   */
  get features () {
    return this.features_;
  }

  /**
   * @type {number}
   */
  get angle () {
    return this.getAngle();
  }

  /**
   * @param {number} angle
   */
  set angle (angle) {
    this.setAngle(angle);
  }

  /**
   * @type {ol.Coordinate|undefined}
   */
  get anchor () {
    return this.getAnchor();
  }

  /**
   * @param {ol.Coordinate|undefined} anchor
   */
  set anchor (anchor) {
    this.setAnchor(anchor);
  }

  /**
   * @param {ol.Map} map
   */
  set map (map) {
    this.setMap(map);
  }

  /**
   * @type {ol.Map}
   */
  get map () {
    return this.getMap();
  }

  /**
   * @param {boolean} active
   */
  set active (active) {
    this.setActive(active);
  }

  /**
   * @type {boolean}
   */
  get active () {
    return this.getActive();
  }

  /**
   * @param {ol.Map} map
   */
  setMap (map) {
    this.overlay_.setMap(map);
    super.setMap(map);
  }

  /**
   * @param {boolean} active
   */
  setActive (active) {
    if (this.overlay_) {
      this.overlay_.setMap(active ? this.map : undefined);
    }

    super.setActive(active);
  }

  /**
   * Set current angle of interaction features.
   *
   * @param {number} angle
   */
  setAngle (angle) {
    this.set(ANGLE_PROP, parseFloat(angle));
  }

  /**
   * Returns current angle of interaction features.
   *
   * @return {number}
   */
  getAngle () {
    return this.get(ANGLE_PROP);
  }

  /**
   * Set current anchor position.
   *
   * @param {ol.Coordinate | undefined} anchor
   */
  setAnchor (anchor) {
    this.set(
      ANCHOR_PROP,
      anchor != null
        ? anchor.map(parseFloat)
        : getFeaturesCentroid(this.features_)
    );
  }

  /**
   * Returns current anchor position.
   *
   * @return {ol.Coordinate | undefined}
   */
  getAnchor () {
    return this.get(ANCHOR_PROP);
  }

  /**
   * @private
   */
  createOrUpdateAnchorFeature_ () {
    const angle = this.getAngle();
    const anchor = this.getAnchor();

    if (!anchor) return;

    if (this.anchorFeature_) {
      this.anchorFeature_.getGeometry().setCoordinates(anchor);
      this.anchorFeature_.set(ANGLE_PROP, angle);
    } else {
      this.anchorFeature_ = new Feature({
        geometry: new Point(anchor),
        [ANGLE_PROP]: angle,
        [ANCHOR_KEY]: true
      });
      this.overlay_.getSource().addFeature(this.anchorFeature_);
    }
  }

  /**
   * @private
   */
  createOrUpdateArrowFeature_ () {
    const angle = this.getAngle();
    const anchor = this.getAnchor();

    if (!anchor) return;

    if (this.arrowFeature_) {
      this.arrowFeature_.getGeometry().setCoordinates(anchor);
      this.arrowFeature_.set(ANGLE_PROP, angle);
    } else {
      this.arrowFeature_ = new Feature({
        geometry: new Point(anchor),
        [ANGLE_PROP]: angle,
        [ARROW_KEY]: true
      });
      this.overlay_.getSource().addFeature(this.arrowFeature_);
    }
  }

  /**
   * @private
   */
  resetAngleAndAnchor_ () {
    this.resetAngle_();
    this.resetAnchor_();
  }

  /**
   * @private
   */
  resetAngle_ () {
    this.set(ANGLE_PROP, 0, true);
    this.arrowFeature_ && this.arrowFeature_.set(ANGLE_PROP, this.getAngle());
    this.anchorFeature_ && this.anchorFeature_.set(ANGLE_PROP, this.getAngle());
  }

  /**
   * @private
   */
  resetAnchor_ () {
    this.set(ANCHOR_PROP, getFeaturesCentroid(this.features_), true);
    if (this.getAnchor()) {
      this.arrowFeature_ &&
        this.arrowFeature_.getGeometry().setCoordinates(this.getAnchor());
      this.anchorFeature_ &&
        this.anchorFeature_.getGeometry().setCoordinates(this.getAnchor());
    }
  }

  /**
   * @private
   */
  onFeatureAdd_ () {
    this.resetAngleAndAnchor_();
    this.createOrUpdateAnchorFeature_();
    this.createOrUpdateArrowFeature_();
  }

  /**
   * @private
   */
  onFeatureRemove_ () {
    this.resetAngleAndAnchor_();

    if (this.features_.getLength()) {
      this.createOrUpdateAnchorFeature_();
      this.createOrUpdateArrowFeature_();
    } else {
      this.overlay_.getSource().clear();
      this.anchorFeature_ = this.arrowFeature_ = undefined;
    }
  }

  /**
   * @private
   */
  onAngleChange_ ({ oldValue }) {
    this.features_.forEach(feature =>
      feature.getGeometry().rotate(this.getAngle() - oldValue, this.getAnchor())
    );
    this.arrowFeature_ && this.arrowFeature_.set(ANGLE_PROP, this.getAngle());
    this.anchorFeature_ && this.anchorFeature_.set(ANGLE_PROP, this.getAngle());
  }

  /**
   * @private
   */
  onAnchorChange_ () {
    const anchor = this.getAnchor();

    if (anchor) {
      this.anchorFeature_ &&
        this.anchorFeature_.getGeometry().setCoordinates(anchor);
      this.arrowFeature_ &&
        this.arrowFeature_.getGeometry().setCoordinates(anchor);
    }
  }

  /**
   * @param {ol.Collection<ol.Feature>} features
   * @private
   */
  dispatchRotateStartEvent_ (features) {
    this.dispatchEvent(
      new RotateFeatureEvent(
        RotateFeatureEventType.START,
        features,
        this.getAngle(),
        this.getAnchor()
      )
    );
  }

  /**
   * @param {ol.Collection<ol.Feature>} features
   * @private
   */
  dispatchRotatingEvent_ (features) {
    this.dispatchEvent(
      new RotateFeatureEvent(
        RotateFeatureEventType.ROTATING,
        features,
        this.getAngle(),
        this.getAnchor()
      )
    );
  }

  /**
   * @param {ol.Collection<ol.Feature>} features
   * @private
   */
  dispatchRotateEndEvent_ (features) {
    this.dispatchEvent(
      new RotateFeatureEvent(
        RotateFeatureEventType.END,
        features,
        this.getAngle(),
        this.getAnchor()
      )
    );
  }
}

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {RotateFeatureInteraction}
 * @private
 */
function handleEvent (evt) {
  // disable selection of inner features
  const foundFeature = evt.map.forEachFeatureAtPixel(
    evt.pixel,
    feature => feature
  );
  if (
    ['click', 'singleclick', 'dblclick'].indexOf(evt.type) > -1 &&
    [this.anchorFeature_, this.arrowFeature_].indexOf(foundFeature) > -1
  ) {
    return false;
  }

  return PointerInteraction.handleEvent.call(this, evt);
}

/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @return {boolean}
 * @this {RotateFeatureInteraction}
 * @private
 */
function handleDownEvent (evt) {
  const foundFeature = evt.map.forEachFeatureAtPixel(
    evt.pixel,
    feature => feature
  );
  // handle click & drag on features for rotation
  if (
    foundFeature &&
    !this.lastCoordinate_ &&
    (this.features_.getArray().indexOf(foundFeature) > -1 ||
      foundFeature === this.arrowFeature_)
  ) {
    this.lastCoordinate_ = evt.coordinate;
    handleMoveEvent.call(this, evt);
    this.dispatchRotateStartEvent_(this.features_);
    return true;
  } else if (foundFeature && foundFeature === this.anchorFeature_) {
    this.anchorMoving_ = true;
    handleMoveEvent.call(this, evt);
    return true;
  }

  return false;
}

/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @return {boolean}
 * @this {RotateFeatureInteraction}
 * @private
 */
function handleUpEvent (evt) {
  // stop drag sequence of features
  if (this.lastCoordinate_) {
    this.lastCoordinate_ = undefined;
    handleMoveEvent.call(this, evt);
    this.dispatchRotateEndEvent_(this.features_);
    return true;
  } else if (this.anchorMoving_) {
    this.anchorMoving_ = false;
    handleMoveEvent.call(this, evt);
    return true;
  }
  return false;
}

/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @return {boolean}
 * @this {RotateFeatureInteraction}
 * @private
 */
function handleDragEvent ({ coordinate }) {
  const anchorCoordinate = this.anchorFeature_.getGeometry().getCoordinates();
  // handle drag of features by angle
  if (this.lastCoordinate_) {
    // calculate vectors of last and current pointer positions
    const lastVector = [
      this.lastCoordinate_[0] - anchorCoordinate[0],
      this.lastCoordinate_[1] - anchorCoordinate[1]
    ];
    const newVector = [
      coordinate[0] - anchorCoordinate[0],
      coordinate[1] - anchorCoordinate[1]
    ];
    // calculate angle between last and current vectors (positive angle counter-clockwise)
    let angle = Math.atan2(
      lastVector[0] * newVector[1] - newVector[0] * lastVector[1],
      lastVector[0] * newVector[0] + lastVector[1] * newVector[1]
    );
    this.setAngle(this.getAngle() + angle);
    this.dispatchRotatingEvent_(this.features_);
    this.lastCoordinate_ = coordinate;
  } else if (this.anchorMoving_) {
    this.setAnchor(coordinate);
  }
}

/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @return {boolean}
 * @this {RotateFeatureInteraction}
 * @private
 */
function handleMoveEvent ({ map, pixel }) {
  const elem = map.getTargetElement();
  const foundFeature = map.forEachFeatureAtPixel(pixel, feature => feature);
  const setCursor = (cursor, vendor = false) => {
    if (vendor) {
      elem.style.cursor = '-webkit-' + cursor;
      elem.style.cursor = '-moz-' + cursor;
    }
    elem.style.cursor = cursor;
  };
  if (this.lastCoordinate_) {
    this.previousCursor_ = elem.style.cursor;
    setCursor('grabbing', true);
  } else if (
    foundFeature &&
    (this.features_.getArray().indexOf(foundFeature) > -1 ||
      foundFeature === this.arrowFeature_)
  ) {
    this.previousCursor_ = elem.style.cursor;
    setCursor('grab', true);
  } else if (
    (foundFeature && foundFeature === this.anchorFeature_) ||
    this.anchorMoving_
  ) {
    this.previousCursor_ = elem.style.cursor;
    setCursor('crosshair');
  } else {
    setCursor(this.previousCursor_ || '');
    this.previousCursor_ = undefined;
  }
}

/**
 * get style
 * @returns {Function}
 */
function getDefaultStyle () {
  const white = [255, 255, 255, 0.8];
  const blue = [0, 153, 255, 0.8];
  const transparent = [255, 255, 255, 0.01];
  const width = 2;
  const styles = {
    [ANCHOR_KEY]: [
      new olStyleFactory({
        image: {
          type: '',
          image: {
            points: 6,
            radius: 4,
            stroke: {
              strokeColor: blue,
              strokeWidth: 1
            },
            fill: {
              fillColor: [0, 153, 255, 0.8]
            }
          }
        },
        zIndex: Infinity
      })
    ],
    [ARROW_KEY]: [
      new olStyleFactory({
        fill: {
          fillColor: transparent
        },
        stroke: {
          strokeColor: white,
          strokeWidth: width + 2
        },
        text: {
          textFont: 'normal normal 100 12px ArialMT',
          textOffsetX: 20,
          textOffsetY: -20,
          textOverflow: true,
          textFill: {
            fillColor: 'blue'
          },
          textStroke: {
            strokeColor: white,
            strokeWidth: width + 1
          }
        },
        zIndex: Infinity
      }),
      new olStyleFactory({
        fill: {
          fillColor: transparent
        },
        stroke: {
          strokeColor: blue,
          strokeWidth: width
        },
        zIndex: Infinity
      })
    ]
  };
  return function (feature, resolution) {
    let style;
    const angle = feature.get(ANGLE_PROP) || 0;
    switch (true) {
      case feature.get(ANCHOR_KEY):
        style = styles[ANCHOR_KEY];
        style[0].getImage().setRotation(-angle);
        return style;
      case feature.get(ARROW_KEY):
        style = styles[ARROW_KEY];
        const coordinates = feature.getGeometry().getCoordinates();
        // generate arrow polygon
        const geom = new Polygon([
          [
            [coordinates[0], coordinates[1] - 6 * resolution],
            [coordinates[0] + 8 * resolution, coordinates[1] - 12 * resolution],
            [coordinates[0], coordinates[1] + 30 * resolution],
            [coordinates[0] - 8 * resolution, coordinates[1] - 12 * resolution],
            [coordinates[0], coordinates[1] - 6 * resolution]
          ]
        ]);
        // and rotate it according to current angle
        geom.rotate(angle, coordinates);
        style[0].setGeometry(geom);
        style[1].setGeometry(geom);
        style[0].getText().setText(Math.round((-angle * 180) / Math.PI) + '°');
        return style;
    }
  };
}

/**
 * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features
 * @returns {ol.Extent | undefined}
 * @private
 */
function getFeaturesExtent (features) {
  features = features instanceof Collection ? features.getArray() : features;
  if (!features.length) return;
  return new GeometryCollection(
    features.map(feature => feature.getGeometry())
  ).getExtent();
}

/**
 * @param {ol.Collection<ol.Feature> | Array<ol.Feature>} features
 * @return {ol.Coordinate | undefined}
 */
function getFeaturesCentroid (features) {
  features = features instanceof Collection ? features.getArray() : features;
  if (!features.length) return;
  return extentHelper.getCenter(getFeaturesExtent(features));
}

ol.interaction.RotateFeature = RotateFeatureInteraction;

export default RotateFeatureInteraction;
