import { isFunc } from '../utils';

export const initUse = (Mol) => {
	/**
	* 用于注册插件
	* @param {*} plugin 
	*/
	Mol.use = function use(plugin, ...args) {
		const installedPlugins = this._installedPlugins || (this._installedPlugins = []);
		if (installedPlugins.indexOf(plugin) > -1) return this;

		const install = plugin.install || plugin;
		if (isFunc(install)) {
		   install.apply(plugin, [this, ...args]);
		   installedPlugins.push(plugin);
		} else {
		   console.error(`plugin's 'install' method or plugin should be a function.`);
		}
		return this;
	};
};