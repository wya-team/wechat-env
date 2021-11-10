import Dola from './dola';
import setupApp from './native/app';
import setupPage from './native/page';
import setupComponent from './native/component';
import router from './plugins/router';
import promisify from './plugins/promisify';

const dola = new Dola();

const setup = setupOptions => {
	dola.app = setupApp(setupOptions.app || {}, dola);
	dola.page = setupPage(setupOptions.page || {}, dola);
	dola.component = setupComponent(setupOptions.component || {}, dola);
};

export default dola;

export {
	setup,
	router,
	promisify
};