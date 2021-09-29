import createApp from './app';
import createPage from './page';
import createComponent from './component';
import { net } from './network/index';

const init = () => {
	Page = createPage;
	Component = createComponent;
};

export {
	createApp,
	init,
	net
};