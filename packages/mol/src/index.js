import Mol from './class/mol';
import setupApp from './native/app';
import setupPage from './native/page';
import setupComponent from './native/component';
import { initGlobalApi } from './global-apis/index';

initGlobalApi(Mol);

const setup = (setupOptions = {}) => {
	const { provider, plugins } = setupOptions;

	provider && Mol.provider.set(provider());

	Mol.app = setupApp(setupOptions.app || {});
	Mol.page = setupPage(setupOptions.page || {});
	Mol.component = setupComponent(setupOptions.component || {});
	Mol.options.router = setupOptions.router;

	if (plugins && plugins.length) {
		plugins.forEach(plugin => {
			// 需要传递注册配置的插件可按这种规则：plugins: [[xxxPlugin, arg1, arg2, ...]]
			if (Array.isArray(plugin)) {
				Mol.use(plugin[0], ...plugin.slice(1));
			} else {
				Mol.use(plugin);
			}
		});
	}
};

export default Mol;

export {
	setup
};