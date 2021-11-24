import Mol, { Provider } from './mol/index';
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

const mol = new Mol();

const setup = setupOptions => {
	mol.provider = new Provider(setupOptions.provider());
	mol.app = setupApp(setupOptions.app || {}, mol);
	mol.page = setupPage(setupOptions.page || {}, mol);
	mol.component = setupComponent(setupOptions.component || {}, mol);
};

export default mol;

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