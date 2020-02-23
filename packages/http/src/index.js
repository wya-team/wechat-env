import HttpShell from './core/HttpShell';
import HttpAdapter from './core/HttpAdapter';
import HttpError from './core/HttpError';

const createHttpClient = (registerOptions = {}) => {

	const clientWrapper = new HttpShell(registerOptions);
	
	const allowMethod = ['ajax', 'get', 'post', 'put', 'delete', 'option', 'form'];

	const client = {};
	allowMethod.forEach(m => {
		client[m] = async (userOptions) => {
			return clientWrapper[m](userOptions);
		};
	});

	return client;
};

export const { ajax } = createHttpClient();
export {
	HttpShell,
	HttpAdapter,
	HttpError
};
export default createHttpClient;
