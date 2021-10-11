import createApp from './app';
import bootstrapPage from './page';
import bootstrapComponent from './component';
import bootstrapWx from './wx/index';

const core = {};

const bootstrap = options => {
	bootstrapWx(wx, options.wx);
	core.page = bootstrapPage(options.page);
	core.component = bootstrapComponent(options.component);
};

export {
	createApp,
	bootstrap,
	core
};