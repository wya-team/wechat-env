const { getNewContent, getExtra, getMutationType } = require('../utils/helper');

exports.page = (content, opts = {}) => {
	const { mutation, humpMutation, pathArr, project, packageName, obj, pagingMode: mode, pagingType: type, route, title } = opts;
	let extra = getExtra(pathArr);

	let mutationType = `${getMutationType(pathArr, packageName)}`;
	let pagingType = mutationType + '_LIST';
	const relativePath = packageName !== 'pages' ? '../' : '';

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
				contents += `			wx:for="{{tabs}}"\n`;
				contents += `			wx:key="index"\n`;
				contents += `			title="{{ item.label }}"\n`;
				contents += `			name="{{ item.value }}"\n`;
				contents += `		>\n`;
				contents += `			<mc-recycle-list\n`;
				contents += `				show="{{ item.value == type }}"\n`;
				contents += `				height="100%"\n`;
				contents += `				total="{{ listInfo[item.value].total }}"\n`;
				contents += `				bind:loadData="loadData"\n`;
				contents += `			>\n`;
				contents += `				<${project}-item \n`;
				contents += `					wx:for="{{ listInfo[item.value].data }}"\n`;
				contents += `					wx:key="index"\n`;
				contents += `					it="{{ item }}}"\n`;
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
				contents += `		bind:loadData="loadData"\n`;
				contents += `	>\n`;
				contents += `		<${project}-item \n`;
				contents += `			wx:for="{{ listInfo.data }}"\n`;
				contents += `			wx:key="index"\n`;
				contents += `			it="{{ item }}"\n`;
				contents += `		/>\n`;
				contents += `	</mc-recycle-list>\n`;
				contents += `</template>\n`;
				break;
		}
		contents += `\n`;
		contents += `<script>\n`;
		contents += `import Page from '../../${relativePath}common/page';\n`;
		contents += `\n`;
		contents += `Page({\n`;
		contents += `	mapState(state) {\n`;
		contents += `		const { ${humpMutation}${extra} } = state;\n`;
		contents += `		return {\n`;
		contents += `			listInfo: ${humpMutation}${extra}.listInfo\n`;
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
		contents += `	loadData(event) {\n`;
		contents += `		const { page, done, refresh } = event.detail;\n`;
		contents += `		this.request({\n`;
		contents += `			url: '${pagingType}_GET',\n`;
		contents += `			type: 'GET',\n`;
		contents += `			param: {\n`;
		switch (type) {
			case 'tabs':
				contents += `				type: this.data.type,\n`;
				break;
			default:
				break;
		}
		contents += `				page,\n`;
		contents += `			},\n`;
		contents += `			refresh\n`;
		contents += `		}).then((res) => {\n`;
		contents += `			done && done();\n`;
		contents += `		}).catch((error) => {\n`;
		contents += `			console.log(error, 'error');\n`;
		contents += `		});\n`;
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

