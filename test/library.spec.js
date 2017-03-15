/*global describe, it, before */

import chai from 'chai';
import Library from '../dist/HMap.js';

chai.expect();

const expect = chai.expect;

let lib;

describe('Given an instance of my library',  () => {
  before(() => {
    lib = new Library.Map('map', {});
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.map).to.be.equal('Library');
    });
  });
});
