const HMap = {};
import { Map, Layer, config } from './constants'
HMap.version = require('../package.json').version;

HMap.Map = Map;
HMap.Layer = Layer;
HMap.config = config;

export default HMap