// app、page和组件配置中值为纯对象的字段
export const PLAIN_OBJECT_FIELDS = [
	'properties',
	'props',
	'data',
	'observers',
	'methods',
	'relations',
	'options',
	'definitionFilter'
];

/**
 * 框架内置配置字段，不会传入原生构造options的字段
 */
export const BUILT_IN_FIELDS = [
	'injector'
];