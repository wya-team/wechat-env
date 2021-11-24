import { patchAppLifecycle } from '../init/index';

export default (setupOptions, mol) => {
	return appOptions => {
		// 最先执行patch，保证在到达业务层的前一步会做可能需要的wait
		patchAppLifecycle(appOptions, mol);
		return App(appOptions);
	};
};