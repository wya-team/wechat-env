const { expect } = require('chai');
const { Utils } = require('..');

describe('url.js', () => {
	it('验证api', () => {
		expect(typeof Utils).to.equal('object');

		Utils.set({
			invoke() {
				return 1;
			}
		});

		expect(Utils.invoke()).to.equal(1);
	});
});
