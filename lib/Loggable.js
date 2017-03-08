/**
 * Created by FDD on 2017/3/8.
 */
class Loggable {
  constructor () {
    this.model = 'loggable';
  }

  getMap () {
    return this.map;
  }

  creatNum () {
    return Math.random();
  }
}
export default Loggable