const { expect } = require('chai');
require('..');

describe('polyfill.js', () => {
	it('验证注入信息', () => {
		let root = typeof global !== 'undefined'
			? global
			: typeof window !== 'undefined'
				? window
				: typeof self !== 'undefined'
					? self
					: typeof this !== 'undefined'
						? this
						: undefined;
						
		expect(typeof root.Date).to.equal('function');
	});
});
