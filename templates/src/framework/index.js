import createApp from './app';
import bootstrapPage from './page';
import bootstrapComponent from './component';

const core = {};

const bootstrap = options => {
	core.page = bootstrapPage(options.page);
	core.component = bootstrapComponent(options.component);
};

export {
	createApp,
	bootstrap,
	core
};