const { expect } = require('chai');
const { URL } = require('..');

describe('url.js', () => {
	it('验证api', () => {
		expect(typeof URL).to.equal('object');
	});
});
