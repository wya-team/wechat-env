import { isFunc } from '../utils';

/**
* 注册插件
* @param {*} plugin 
*/
export function use(plugin, ...args) {
	if (plugin.installed) return;
	const install = plugin.install || plugin;

	if (isFunc(install)) {
	   install.apply(plugin, [this, ...args]);
	   plugin.installed = true;
	} else {
	   throw new Error("plugin's install method is requird.");
	}
}