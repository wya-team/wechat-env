const { expect } = require('chai');
const { Calc } = require('..');

describe('calc.js', () => {
	it('验证api', () => {
		expect(Calc(1).add(1).val()).to.equal(2);
		expect(Calc(2).sub(1).val()).to.equal(1);
		expect(Calc(2).div(1).val()).to.equal(2);
	});
});
