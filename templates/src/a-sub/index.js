/**
 * 由于小程序分包没有提供类似分包入口文件的支持，
 * 且由于使用了 lazyCodeLoading 特性，
 * 所以需要将该文件在分包中的各页面（保证进入任何一个页面都能正常注册）中引入才能执行
 */
import Store from './stores/root';

Store.init();

