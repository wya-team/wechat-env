import Mol from './mol';
import { mergePageOptions, resolveConstructorOptions } from '../utils';

export default class MolPage extends Mol {
	// 父类，用于扩展，如插件可以给原型上添加某个方法
	static super = Mol;

	static type = 'page';

	static options = Object.create(null)

	constructor(options) {
		super(options);

		this._init(options);
	}

	_init(options) {
		this.$options = mergePageOptions(
			resolveConstructorOptions(MolPage),
			options
		);
	}
}