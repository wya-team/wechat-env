import Mol from './mol';
import { mergeAppOptions, resolveConstructorOptions } from '../utils';

export default class MolApp extends Mol {
	static super = Mol;

	static options = Object.create(null);

	constructor(options = {}) {
		super(options);

		this._init(options);
	}

	_init(options) {
		this.$options = mergeAppOptions(
			resolveConstructorOptions(MolApp),
			options
		);
	}
}