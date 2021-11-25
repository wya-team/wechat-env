import Mol from './class/mol';
import setupApp from './native/app';
import setupPage from './native/page';
import setupComponent from './native/component';
import { initGlobalApi } from './global-apis/index';
import {
	authorizeManager,
	locationManager,
	sourceManager,
	updateManager,
	queryParser,
	promisify,
	router
} from './plugins/index';

initGlobalApi(Mol);

const setup = setupOptions => {
	setupOptions.provider && Mol.provider.set(setupOptions.provider());
	Mol.app = setupApp(setupOptions.app || {});
	Mol.page = setupPage(setupOptions.page || {});
	Mol.component = setupComponent(setupOptions.component || {});
};

export default Mol;

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