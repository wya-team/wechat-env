const { expect } = require('chai');
const { RegEx } = require('..');

describe('regex.js', () => {
	it('验证api', () => {
		expect(RegEx.num.test(123)).to.equal(true);
		expect(RegEx.email.test(123)).to.equal(false);

		RegEx.set('xxx', { value: /1/, msg: "222" });
		expect(RegEx.xxx.test(1)).to.equal(true);


		expect(typeof RegEx.validator).to.equal('function');

		RegEx.validator({ required: true }, '', (errorMsg) => {
			expect(errorMsg).to.equal('必填');
		});

		RegEx.validator({ required: true, type: "mobile" }, '16', (errorMsg) => {
			expect(errorMsg).to.equal('请填写正确的手机号码');
		});

		RegEx.validator({ 
			required: true, 
			type: ["mobile", "email"], // 可以是mobile也可以是email
			msg: "test" 
		}, '16', (errorMsg) => {
			expect(errorMsg).to.equal('test');
		});


		RegEx.validator({ 
			required: () => {
				return true;
			}, 
		}, '', (errorMsg) => {
			expect(errorMsg).to.equal('必填');
		});

		RegEx.validator({ 
			required: (done) => {
				done('由我来控制报错');
			}, 
		}, '', (errorMsg) => {
			expect(errorMsg).to.equal('由我来控制报错');
		});

		RegEx.validator({ 
			type: () => {
				return false;
			}, 
		}, '222', (errorMsg) => {
			expect(errorMsg).to.equal(undefined);
		});

		RegEx.validator({ 
			type: (done) => {
				done('由我来控制报错');
			}, 
		}, '222', (errorMsg) => {
			expect(errorMsg).to.equal('由我来控制报错');
		});

	});
});
