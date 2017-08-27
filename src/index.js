const supported = require('mapbox-gl-supported')
const version = require('../package.json').version

module.exports = {
  version,
  supported,
  /**
   * Gets and sets the map's [access token](https://www.mapbox.com/help/define-access-token/).
   *
   * @var {string} accessToken
   * @example
   * mapboxgl.accessToken = myAccessToken;
   * @see [Display a map](https://www.mapbox.com/mapbox-gl-js/examples/)
   */
  get accessToken() {
    return config.ACCESS_TOKEN;
  },

  set accessToken(token: string) {
    config.ACCESS_TOKEN = token;
  }
};

/**
 * The version of hmap-js in use as specified in `package.json`,
 * `CHANGELOG.md`, and the GitHub release.
 * @var {string} version
 */
