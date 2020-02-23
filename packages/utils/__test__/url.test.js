import { URL } from '..';

describe('url.js', () => {
	test('验证api', () => {
		expect(URL === window.URL).toBe(false);

		// 设置当前网址
		window.history.replaceState(null, null, '/home/main?user=wya');

		expect(URL.parse().query.user).toBe('wya');
		
		expect(URL.merge({
			path: '/home/main',
			query: {
				user: 'wya'
			}
		})).toBe('/home/main?user=wya');

		expect(URL.get('user')).toBe('wya');
		expect(URL.get('user2')).toBe(null);

		expect(URL.merge({
			path: '/home/main?test=1',
			query: {
				user: 'wya'
			}
		})).toBe('/home/main?test=1&user=wya');

		let url = '/xls/agent/join/goods-set-meal?user=wya&name=%3F%3F%E5%88%86%E4%BA%AB%3F%3F%3F&mode=2';
		expect(URL.parse(url).query.mode).toBe(2);

		// 设置当前网址
		window.history.replaceState(null, null, url);
		expect(URL.parse().query.mode).toBe(2);

	});
});
