import Mol from './mol';
import {
	mergeComponentOptions,
	normalizeComponentOptions,
	resolveConstructorOptions,
	getValueDescriptor
} from '../utils';

export default class MolComponent extends Mol {
	static super = Mol;

	static type = 'component';

	static options = Object.create(null, {
		options: getValueDescriptor({
			addGlobalClass: true,
			multipleSlots: true
		}),
		externalClasses: getValueDescriptor(['custom-class']),
		properties: getValueDescriptor({ customStyle: String }),
		data: getValueDescriptor({
			// 页面参数
			$query: {}
		}),
		methods: getValueDescriptor({
			$emit(...args) {
				this.triggerEvent(...args);
			}
		})
	})

	constructor(options) {
		normalizeComponentOptions(options);

		super(options);

		this._isComponent = true;
	
		this._init(options);
	}

	_init(options) {
		this.$options = mergeComponentOptions(
			resolveConstructorOptions(MolComponent),
			options
		);
	}
}