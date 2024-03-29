const { getNewContent, getStoreKey, getMutationType } = require('../utils/helper');

exports.page = (content, opts = {}) => {
	const { isSubPackage, platform, mutation, pathArr, project, packageName, obj, pagingMode: mode, pagingType: type, route, title } = opts;
	let storeKey = getStoreKey(pathArr, packageName);

	let mutationType = `${getMutationType(pathArr, packageName)}`;
	let pagingType = mutationType + '_LIST';

	try {
		let contents = '';
		switch (type) {
			case 'tabs':
				contents += `<template>\n`;
				contents += `	<mc-tabs \n`;
				contents += `		active="{{ type }}" \n`;
				contents += `		color="#000"\n`;
				contents += `		bind:click="handleChange"\n`;
				contents += `	>\n`;
				contents += `		<mc-tabs-pane \n`;
				contents += `			${platform}:for="{{tabs}}"\n`;
				contents += `			${platform}:key="index"\n`;
				contents += `			title="{{ item.label }}"\n`;
				contents += `			name="{{ item.value }}"\n`;
				contents += `		>\n`;
				contents += `			<mc-recycle-list\n`;
				contents += `				show="{{ item.value == type }}"\n`;
				contents += `				height="100%"\n`;
				contents += `				total="{{ listInfo[item.value].total }}"\n`;
				contents += `				current="{{ listInfo[item.value].current }}"\n`;
				contents += `				bind:loadData="loadData"\n`;
				contents += `			>\n`;
				contents += `				<${project}-item \n`;
				contents += `					${platform}:for="{{ listInfo[item.value].data }}"\n`;
				contents += `					${platform}:key="index"\n`;
				contents += `					it="{{ item }}"\n`;
				contents += `				/>\n`;
				contents += `			</mc-recycle-list>\n`;
				contents += `		</mc-tabs-pane>\n`;
				contents += `	</mc-tabs>\n`;
				contents += `</template>\n`;
				break;	
			default:
				contents += `<template>\n`;
				contents += `	<mc-recycle-list\n`;
				contents += `		height="100%"\n`;
				contents += `		total="{{ listInfo.total }}"\n`;
				contents += `		current="{{ listInfo.current }}"\n`;
				contents += `		bind:loadData="loadData"\n`;
				contents += `	>\n`;
				contents += `		<${project}-item \n`;
				contents += `			${platform}:for="{{ listInfo.data }}"\n`;
				contents += `			${platform}:key="index"\n`;
				contents += `			it="{{ item }}"\n`;
				contents += `		/>\n`;
				contents += `	</mc-recycle-list>\n`;
				contents += `</template>\n`;
				break;
		}
		contents += `\n`;
		contents += `<script>\n`;

		contents += `import Mol from '@wya/mol';\n`;
		if (packageName !== 'pages') { 
			contents += `import '../../index';\n`;
		}

		contents += `\nMol.page({\n`;
		contents += `	navigator: '${mutationType}',\n`;
		contents += `	mapState(state) {\n`;
		contents += `		const { ${storeKey} } = state;\n`;
		contents += `		return {\n`;
		contents += `			listInfo: ${storeKey}.listInfo\n`;
		contents += `		};\n`;
		contents += `	},\n`;
		contents += `	data: {\n`;
		switch (type) {
			case 'tabs':
				contents += `		type: '1',\n`;
				contents += `		tabs: [\n`;
				contents += `			{ label: '标签一', value: '1' }, \n`;
				contents += `			{ label: '标签二', value: '2' }, \n`;
				contents += `			{ label: '标签三', value: '3' }\n`;
				contents += `		],\n`;
				break;
			default:
				
		}
		contents += `	},\n`;
		switch (type) {
			case 'tabs':
				contents += `	onLoad(query) {\n`;
				contents += `		const { type = '1' } = query || {};\n`;
				contents += `		this.setData({ type });\n`;
				contents += `	},\n`;
				break;
			default:
				break;
		}
		contents += `	async loadData(event) {\n`;
		contents += `		const { page, done, refresh } = event.detail;\n`;
		contents += `		try {\n`;
		contents += `			await this.request({\n`;
		contents += `				url: '${pagingType}_GET',\n`;
		contents += `				type: 'GET',\n`;
		contents += `				param: {\n`;
		switch (type) {
			case 'tabs':
				contents += `					type: this.data.type,\n`;
				break;
			default:
				break;
		}
		contents += `					page,\n`;
		contents += `				},\n`;
		contents += `				refresh\n`;
		contents += `			});\n`;
		contents += `			done && done();\n`;
		contents += `		} catch (error) {\n`;
		contents += `			console.log(error, 'error');\n`;
		contents += `		}\n`;
		contents += `	},\n`;
		switch (type) {
			case 'tabs':
				contents += `	handleChange(event) {\n`;
				contents += `		this.setData({ type: event.detail.name });\n`;
				contents += `	},\n`;
				break;
			default:
				break;
		}
		contents += `});\n`;
		contents += `\n`;
		contents += `</script>\n`;
		contents += `\n`;
		contents += `<style lang="scss">\n`;
		contents += `\n`;
		contents += `</style>\n\n`;
		contents += `<config>\n`;
		contents += `{\n`;
		contents += `	"navigationBarTitleText": "${title}",\n`;
		contents += `	"usingComponents": {\n`;
		// 字节还不支持全局注册
		if (platform === 'tt') {
			let patchPath = isSubPackage ? '../' : '';
			contents += `		"mc-tabs": "../../${patchPath}libs/mc/tabs/index",\n`;
			contents += `		"mc-tabs-pane": "../../${patchPath}libs/mc/tabs/tabs-pane",\n`;
			contents += `		"mc-recycle-list": "../../${patchPath}libs/mc/recycle-list/index",\n`;
		}
		contents += `		"${project}-item": "../../components/${mutation}/${pathArr[1]}/item"\n`;
		contents += `	},\n`;
		contents += `	"enablePullDownRefresh": false,\n`;
		contents += `	"disableScroll": true\n`;
		contents += `}\n`;
		contents += `</config>\n`;
		return contents;
	} catch (e) {
		console.log(e);
		return content;
	}
};

