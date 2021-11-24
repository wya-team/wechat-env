import Dola, { Provider } from './dola/index';
import setupApp from './native/app';
import setupPage from './native/page';
import setupComponent from './native/component';
import {
	authorizeManager,
	locationManager,
	sourceManager,
	updateManager,
	queryParser,
	promisify,
	router
} from './plugins/index';

const dola = new Dola();

const setup = setupOptions => {
	dola.provider = new Provider(setupOptions.provider());
	dola.app = setupApp(setupOptions.app || {}, dola);
	dola.page = setupPage(setupOptions.page || {}, dola);
	dola.component = setupComponent(setupOptions.component || {}, dola);
};

export default dola;

export {
	setup,
	authorizeManager,
	locationManager,
	sourceManager,
	updateManager,
	queryParser,
	promisify,
	router
};