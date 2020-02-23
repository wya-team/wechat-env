const { expect } = require('chai');
const { Storage } = require('..');

describe('cache.js', () => {
	it('验证api', () => {
		expect(typeof Storage).to.equal('object');
	});
});
