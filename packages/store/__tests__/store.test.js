const { expect } = require('chai');

const { Store, default: connect } = require('../src');
const createLogger = require('../src/plugins/logger').default; 
const PageNative = require('./native/page');
const modules = require('./modules').default;

let Page = connect(PageNative);

global.getApp = () => ({
	store: new Store({
		plugins: [createLogger({ logger: { log() {} } })],
		actions: {
			ASYNC_DECREMENT(store, options = {}) {
				return new Promise((resolve) => {
					setTimeout(() => {
						store.commit({ type: 'FORCE_SETTING', count: 100 });
						resolve();
					}, 200);
				});
				
			}
		},
		modules
	})
});

describe('@wya/mp-store', () => {
	it('basic', async () => {
		let page = Page({
			mapState: (state) => state.counter
		});

		// 页面打开
		page.open();

		// 加法
		page.$store.commit({ type: 'INCREMENT' });
		expect(page.data.count).to.equal(1);

		// 减法
		page.$store.commit({ type: 'DECREMENT' });
		expect(page.data.count).to.equal(0);

		// 异步更新
		page.$store.dispatch({ type: 'ASYNC_DECREMENT' });
		await new Promise((r) => setTimeout(r, 1000));
		expect(page.data.count).to.equal(100);

		// 页面关闭
		page.close();
		page.$store.commit({ type: 'FORCE_SETTING', count: 10 });

		// 已经卸载，无法变更，无法刷新
		expect(page.data.count).to.equal(100);

		// 但是值会被重新变更
		expect(page.$store.state.counter.count).to.equal(10);
	});

	it('mapState', () => {
		let page = Page({
			mapState: ['counter']
		});

		// 页面打开
		page.open();
		expect(page.data.counter.count).to.equal(10);

		// 页面关闭
		page.close();
	});
});