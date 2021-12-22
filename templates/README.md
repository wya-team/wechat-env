# 说明文档

# 字节小程序注意事项(2021-12-21)

> 相对与微信小程序不支持的地方

- 【`@wya/mp-polyfill`】：增加`tt.nextTick`, 兼容`wx.nextTick`
- 【不支持】：函数无法作为参数传递：`<my-comp prop="{{ target }}">`, 即`target.xxx`不能是函数
- 【不支持】：无法全局注册全局组件，`app.json -> usingComponents`无法作用