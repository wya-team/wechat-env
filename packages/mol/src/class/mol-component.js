import Mol from './mol';
import { mergeComponentOptions, resolveConstructorOptions } from '../utils';

export default class MolComponent extends Mol {
	static super = Mol;

	static options = Object.create(null, {
		options: {
			addGlobalClass: true,
			multipleSlots: true
		},
		externalClasses: ['custom-class'],
		properties: {
			customStyle: String
		},
		methods: {
			$emit(...args) {
				this.triggerEvent(...args);
			}
		}
	})

	constructor(options) {
		super(options);
	
		this._init(options);
	}

	_init(options) {
		this.$options = mergeComponentOptions(
			resolveConstructorOptions(MolComponent),
			options
		);
	}
}