/**
 * Created by FDD on 2017/3/8.
 */
class Test {
  constructor () {
    this.map = 'Test';
  }

  delAtrr (attr) {
    return delete attr.geometry;
  }
}
export default Test