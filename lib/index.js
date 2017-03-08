const HMap = {};
import config from './config/mapConfig'
import Map from './map/Map'
import Layer from './layer/Layer'
HMap.version = require('../package.json').version;

HMap.Map = Map;
HMap.Layer = Layer;
HMap.config = config;

export default HMap