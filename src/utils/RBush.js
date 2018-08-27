// form https://github.com/openlayers/openlayers/blob/master/src/ol/structs/RBush.js
import rbush from 'rbush';
import { generateObjectInterFlag, isEmpty, arraySame } from './utils';

class RBush {
  /**
   * @param {number} maxEntries Max entries.
   */
  constructor(maxEntries) {
    /**
     * @private
     */
    this.rbush_ = rbush(maxEntries, undefined);

    /**
     * A mapping between the objects added to this rbush wrapper
     * and the objects that are actually added to the internal rbush.
     * @type {{}}
     * @private
     */
    this.items_ = {};
  }

  /**
   * Insert a value into the RBush.
   * @param extent Extent.
   * @param {T} value Value.
   */
  insert(extent, value) {
    const item = {
      minX: extent[0],
      minY: extent[1],
      maxX: extent[2],
      maxY: extent[3],
      value: value
    };

    this.rbush_.insert(item);
    this.items_[generateObjectInterFlag(value)] = item;
  }

  /**
   * Bulk-insert values into the RBush.
   * @param {Array} extents Extents.
   * @param {Array<T>} values Values.
   */
  load(extents, values) {
    const items = new Array(values.length);
    for (let i = 0, l = values.length; i < l; i++) {
      const extent = extents[i];
      const value = values[i];

      const item = {
        minX: extent[0],
        minY: extent[1],
        maxX: extent[2],
        maxY: extent[3],
        value: value
      };
      items[i] = item;
      this.items_[generateObjectInterFlag(value)] = item;
    }
    this.rbush_.load(items);
  }

  /**
   * Remove a value from the RBush.
   * @param {T} value Value.
   * @return {boolean} Removed.
   */
  remove(value) {
    const uid = generateObjectInterFlag(value);
    // get the object in which the value was wrapped when adding to the
    // internal rbush. then use that object to do the removal.
    const item = this.items_[uid];
    delete this.items_[uid];
    return this.rbush_.remove(item) !== null;
  }

  /**
   * Update the extent of a value in the RBush.
   * @param extent Extent.
   * @param {T} value Value.
   */
  update(extent, value) {
    const item = this.items_[generateObjectInterFlag(value)];
    const bbox = [item.minX, item.minY, item.maxX, item.maxY];
    if (!arraySame(bbox, extent)) {
      this.remove(value);
      this.insert(extent, value);
    }
  }

  /**
   * Return all values in the RBush.
   * @return {Array<T>} All.
   */
  getAll() {
    const items = this.rbush_.all();
    return items.map(function(item) {
      return item.value;
    });
  }

  /**
   * Return all values in the given extent.
   * @return {Array<T>} All in extent.
   */
  getInExtent(extent) {
    const bbox = {
      minX: extent[0],
      minY: extent[1],
      maxX: extent[2],
      maxY: extent[3]
    };
    const items = this.rbush_.search(bbox);
    return items.map(function(item) {
      return item.value;
    });
  }

  /**
   * Calls a callback function with each value in the tree.
   * If the callback returns a truthy value, this value is returned without
   * checking the rest of the tree.
   * @param {function(this: S, T): *} callback Callback.
   * @param {S=} that The object to use as `this` in `callback`.
   * @return {*} Callback return value.
   * @template S
   */
  forEach(callback, that) {
    return this.forEach_(this.getAll(), callback, that);
  }

  /**
   * Calls a callback function with each value in the provided extent.
   * @param extent Extent.
   * @param {function(this: S, T): *} callback Callback.
   * @param {S=} that The object to use as `this` in `callback`.
   * @return {*} Callback return value.
   * @template S
   */
  forEachInExtent(extent, callback, that) {
    return this.forEach_(this.getInExtent(extent), callback, that);
  }

  /**
   * @param {Array<T>} values Values.
   * @param {function(this: S, T): *} callback Callback.
   * @param {S=} that The object to use as `this` in `callback`.
   * @private
   * @return {*} Callback return value.
   * @template S
   */
  forEach_(values, callback, that) {
    let result;
    for (let i = 0, l = values.length; i < l; i++) {
      result = callback.call(that, values[i]);
      if (result) {
        return result;
      }
    }
    return result;
  }

  /**
   * @return {boolean} Is empty.
   */
  isEmpty() {
    return isEmpty(this.items_);
  }

  /**
   * Remove all values from the RBush.
   */
  clear() {
    this.rbush_.clear();
    this.items_ = {};
  }

  /**
   * get extent
   * @param extent
   * @returns {*}
   */
  getExtent(extent) {
    // FIXME add getExtent() to rbush
    const data = this.rbush_.data;
    return [data.minX, data.minY, data.maxX, data.maxY];
  }

  /**
   * concat
   * @param rbush
   */
  concat(rbush) {
    this.rbush_.load(rbush.rbush_.all());
    for (const i in rbush.items_) {
      this.items_[i | 0] = rbush.items_[i | 0];
    }
  }
}

export default RBush;
