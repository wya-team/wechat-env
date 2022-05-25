/**
 * Promise.allSettled polyfill
 */
const allSettledPolyfill = (promises) => {
	return new Promise((resolve) => {
		const result = [];
		let settledCount = 0;

		promises.forEach(task => {
			const item = {
				status: null
			};

			task.then((res) => {
				item.status = 'fulfilled';
				item.value = res;
			}).catch((reason) => {
				item.status = 'rejected';
				item.reason = reason;
			}).finally(() => {
				settledCount++;
				if (settledCount === promises.length) {
					resolve(result);
				}
			});

			result.push(item);
		});
	});
};

export const allPromiseSettled = (promises) => {
	return Promise.allSettled ? Promise.allSettled(promises) : allSettledPolyfill(promises);
};