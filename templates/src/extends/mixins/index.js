import { setupRequestMixin } from './request';
import { setupNavigatorMixin } from './navigator';

export const setupGlobalMixin = (Mol) => {
	setupRequestMixin(Mol);
	setupNavigatorMixin(Mol);
};

