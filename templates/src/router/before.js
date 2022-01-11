import { net } from '../extends/index';

// 需要授权手机号后才可以进入的页面
const MOBILE_REQUIRED_PAGES = [
	
];

// 手机号登录页
const MOBILE_LOGIN_PAGE = '/a-auth/pages/login/index';

/**
 * 守卫路由规则
 * path可为单个path String或者多个path的数组Array<String>
 * onBefore为Function，处理匹配到的路径的before判断，
 * onBefore 返回值所代表的含义：
 * 	true -> 该条规则校验通过，将查找下一项规则进行校验
 * 	false -> 该条规则校验不通过，将阻止跳转，不再进行下一项规则校验
 * 	undefined -> 等同于返回false
 * 	Promise -> 该条规则存在异步逻辑，需等待Promise完成，并将其返回值（规则同上true、false、undefined）作为校验结果
 */
const guardRules = [
	{
		path: '/a-sub/pages/home/main',
		async onBefore(to, from) {
			await new Promise((r, j) => {
				setTimeout(() => {
					r();
				});
			});
			return true;
		}
	}
];

const lastIndex = guardRules.length - 1;

const isMatched = (path, rule) => {
	const rulePath = rule.path;
	return Array.isArray(rulePath) 
		? rulePath.includes(path) 
		: (path === rulePath || rulePath === '*');
};

/**
 * 在守卫规则中查找path符合toPath的规则项，进行校验
 * 串行校验，当前项校验通过才会继续找下一项校验，直到全部校验通过，才会执行next()
 * 如果某一项校验不通过，将终止校验，并执行next(false)，阻止跳转
 * @param {*} toPath 
 * @param {*} index 
 * @param {*} to 
 * @param {*} from 
 * @param {*} next 
 */
const validate = async (
	toPath,
	index,
	to,
	from,
	next
) => {
	const ruleItem = guardRules[index];

	if (!ruleItem) {
		next();
		return;
	}

	if (isMatched(toPath, ruleItem)) {
		let onBeforeRes = ruleItem.onBefore(to, from);

		if (onBeforeRes.then) {
			try {
				// onBeforeRes应返回true（跳转）或者 false（阻止跳转），或者返回跳转重定向路由
				onBeforeRes = await onBeforeRes;
			} catch (error) {
				next(false);
				return;
			}
		}

		if (!onBeforeRes) {
			next(false);
		} else if (typeof onBeforeRes === 'object' && onBeforeRes) {
			next(onBeforeRes);
		} else {
			index < lastIndex
				? validate(toPath, index + 1, to, from, next)
				: next();
		}
	} else {
		index < lastIndex
			? validate(toPath, index + 1, to, from, next)
			: next();
	}
};

const onBeforeEach = async (to, from, next) => {
	try {
		validate(to.path, 0, to, from, next);
	} catch (error) {
		next(false);
		console.error('onBeforeEach error', error);
	}
};

export default onBeforeEach;